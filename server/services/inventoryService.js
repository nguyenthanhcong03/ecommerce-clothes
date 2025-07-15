const Product = require("../models/product");
const InventoryHistory = require("../models/inventoryHistory");
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");

/**
 * Cập nhật số lượng tồn kho cho một biến thể sản phẩm
 */
const updateVariantStock = async (productId, variantId, quantity, reason, notes, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Tìm sản phẩm và biến thể
    const product = await Product.findById(productId).session(session);
    if (!product) {
      throw new ApiError(404, "Sản phẩm không tồn tại");
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      throw new ApiError(404, "Biến thể sản phẩm không tồn tại");
    }

    const previousStock = variant.stock;
    const changeAmount = quantity - previousStock;

    // Xác định loại thao tác (nhập/xuất/điều chỉnh)
    let operationType = "adjustment";
    if (changeAmount > 0) {
      operationType = "import";
    } else if (changeAmount < 0) {
      operationType = "export";
    }

    // Cập nhật số lượng
    variant.stock = quantity;
    await product.save({ session });

    // Lưu lịch sử
    await InventoryHistory.create(
      [
        {
          productId,
          variantId,
          sku: variant.sku,
          type: operationType,
          quantity: Math.abs(changeAmount), // Giá trị tuyệt đối
          previousStock,
          currentStock: quantity,
          reason,
          notes,
          performedBy: userId,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return variant;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Cập nhật hàng loạt số lượng tồn kho cho nhiều biến thể
 */
const bulkUpdateStock = async (updateDataArray, reason, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const results = [];
    const historyRecords = [];

    for (const item of updateDataArray) {
      const { productId, variantId, quantity, notes } = item;

      // Tìm sản phẩm và biến thể
      const product = await Product.findById(productId).session(session);
      if (!product) {
        throw new ApiError(404, `Sản phẩm ${productId} không tồn tại`);
      }

      const variant = product.variants.id(variantId);
      if (!variant) {
        throw new ApiError(404, `Biến thể ${variantId} không tồn tại`);
      }

      const previousStock = variant.stock;
      const changeAmount = quantity - previousStock;

      // Xác định loại thao tác (nhập/xuất/điều chỉnh)
      let operationType = "adjustment";
      if (changeAmount > 0) {
        operationType = "import";
      } else if (changeAmount < 0) {
        operationType = "export";
      }

      // Cập nhật số lượng
      variant.stock = quantity;
      await product.save({ session });

      // Chuẩn bị lịch sử
      historyRecords.push({
        productId,
        variantId,
        sku: variant.sku,
        type: operationType,
        quantity: Math.abs(changeAmount),
        previousStock,
        currentStock: quantity,
        reason,
        notes,
        performedBy: userId,
      });

      results.push({
        productId,
        variantId,
        sku: variant.sku,
        previousStock,
        currentStock: quantity,
        status: "success",
      });
    }

    // Lưu tất cả lịch sử một lúc
    if (historyRecords.length > 0) {
      await InventoryHistory.insertMany(historyRecords, { session });
    }

    await session.commitTransaction();
    return results;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Lấy danh sách sản phẩm có tồn kho thấp
 */
const getLowStockProducts = async (threshold = 5, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const pipeline = [
    // Unwind variants array để xử lý từng biến thể
    { $unwind: "$variants" },
    // Lọc các biến thể có tồn kho thấp hơn ngưỡng
    { $match: { "variants.stock": { $lte: threshold } } },
    // Nhóm lại theo sản phẩm
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        brand: { $first: "$brand" },
        categoryId: { $first: "$categoryId" },
        lowStockVariants: {
          $push: {
            _id: "$variants._id",
            sku: "$variants.sku",
            size: "$variants.size",
            color: "$variants.color",
            stock: "$variants.stock",
            price: "$variants.price",
          },
        },
      },
    },
    // Lookup để lấy thông tin danh mục
    {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "category",
      },
    },
    // // Unwind category array
    // {
    //   $unwind: {
    //     path: "$category",
    //     preserveNullAndEmptyArrays: true,
    //   },
    // },
    // Project để định dạng kết quả cuối cùng
    {
      $project: {
        _id: 1,
        name: 1,
        brand: 1,
        categoryName: "$category.name",
        lowStockVariants: 1,
      },
    },
    // Sort theo số lượng tồn kho (từ thấp đến cao)
    { $sort: { "lowStockVariants.stock": 1 } },
    // Skip và limit cho pagination
    { $skip: skip },
    { $limit: parseInt(limit) },
  ];

  const countPipeline = [
    { $unwind: "$variants" },
    { $match: { "variants.stock": { $lte: threshold } } },
    { $group: { _id: "$_id" } },
    { $count: "total" },
  ];

  const [products, countResult] = await Promise.all([Product.aggregate(pipeline), Product.aggregate(countPipeline)]);

  const total = countResult.length > 0 ? countResult[0].total : 0;
  const totalPages = Math.ceil(total / limit);

  return {
    products,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages,
    },
  };
};

/**
 * Lấy lịch sử xuất nhập kho
 */
const getInventoryHistory = async (filters = {}, page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc") => {
  const skip = (page - 1) * limit;
  const query = {};

  // Áp dụng các bộ lọc
  if (filters.productId) {
    query.productId = mongoose.Types.ObjectId.isValid(filters.productId)
      ? new mongoose.Types.ObjectId(filters.productId)
      : null;
  }

  if (filters.variantId) {
    query.variantId = mongoose.Types.ObjectId.isValid(filters.variantId)
      ? new mongoose.Types.ObjectId(filters.variantId)
      : null;
  }

  if (filters.sku) {
    query.sku = filters.sku;
  }

  if (filters.type && ["import", "export", "adjustment"].includes(filters.type)) {
    query.type = filters.type;
  }

  if (filters.startDate && filters.endDate) {
    query.createdAt = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate),
    };
  } else if (filters.startDate) {
    query.createdAt = { $gte: new Date(filters.startDate) };
  } else if (filters.endDate) {
    query.createdAt = { $lte: new Date(filters.endDate) };
  }

  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  const [history, total] = await Promise.all([
    InventoryHistory.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("productId", "name")
      .populate("performedBy", "firstName lastName email"),
    InventoryHistory.countDocuments(query),
  ]);

  return {
    history,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  updateVariantStock,
  bulkUpdateStock,
  getLowStockProducts,
  getInventoryHistory,
};
