const Category = require("../models/category");
const mongoose = require("mongoose");
const { deleteFileService, deleteMultipleFilesService } = require("./fileService");

const getCategories = async (options = {}) => {
  try {
    const { page = 1, limit = 10, sortBy = "createdAt", order = "desc", search, parentId } = options;

    // Build query
    let query = {};

    if (parentId !== undefined) {
      query.parentId = parentId === "null" ? null : parentId;
    }

    // Search by name or description
    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }];
    }

    // Count total documents
    const total = await Category.countDocuments(query);

    // Get categories with pagination and sorting
    const categories = await Category.find(query)
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select("-__v");

    return {
      categories,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error(`Error getting categories: ${error.message}`);
  }
};

const getCategoryTree = async () => {
  try {
    // Lấy tất cả danh mục từ cơ sở dữ liệu
    const query = {};
    const categories = await Category.find(query);

    // Tạo map để lưu trữ danh mục theo ID
    const categoryMap = {};
    categories.forEach((category) => {
      categoryMap[category._id] = {
        ...category.toObject(),
        children: [],
      };
    });

    // Tạo cây
    const rootCategories = [];
    categories.forEach((category) => {
      const categoryWithChildren = categoryMap[category._id];

      if (category.parentId && categoryMap[category.parentId]) {
        // Thêm danh mục vào danh sách con của danh mục cha
        categoryMap[category.parentId].children.push(categoryWithChildren);
      } else {
        // Nếu không có parentId, thêm vào danh sách gốc
        rootCategories.push(categoryWithChildren);
      }
    });

    return rootCategories;
  } catch (error) {
    throw new Error(`Lỗi khi tạo cây danh mục: ${error.message}`);
  }
};

const hasChildCategories = async (categoryId) => {
  try {
    const count = await Category.countDocuments({ parentId: categoryId });
    return count > 0;
  } catch (error) {
    throw new Error(`Error checking for child categories: ${error.message}`);
  }
};

const hasProducts = async (categoryId) => {
  try {
    const Product = mongoose.model("Product");
    const count = await Product.countDocuments({ categoryId });
    return count > 0;
  } catch (error) {
    throw new Error(`Error checking for products in category: ${error.message}`);
  }
};

const getProductCountsByCategories = async (categoryIds = []) => {
  try {
    const Product = mongoose.model("Product");

    if (!categoryIds.length) {
      // If no specific IDs provided, get counts for all categories
      const categories = await Category.find({}, "_id");
      categoryIds = categories.map((cat) => cat._id);
    }

    const pipeline = [
      { $match: { categoryId: { $in: categoryIds } } },
      { $group: { _id: "$categoryId", count: { $sum: 1 } } },
    ];

    const results = await Product.aggregate(pipeline);

    // Convert to object for easier lookup
    const countsMap = {};
    results.forEach((result) => {
      countsMap[result._id] = result.count;
    });

    // Ensure all requested categories have a count (even if 0)
    const finalCountsMap = {};
    categoryIds.forEach((id) => {
      finalCountsMap[id] = countsMap[id] || 0;
    });

    return finalCountsMap;
  } catch (error) {
    throw new Error(`Error getting product counts: ${error.message}`);
  }
};

const deleteCategory = async (categoryId) => {
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    if (category.images && category.images.length > 0) {
      const imagesToDelete = category.images;
      if (imagesToDelete.length > 0) {
        console.log("category", categoryId);
        await deleteMultipleFilesService(imagesToDelete);
      }
    }

    const deletedCategory = await Category.findByIdAndDelete(categoryId);
    return deletedCategory;
  } catch (error) {
    throw new Error(`Lỗi khi xóa danh mục: ${error.message}`);
  }
};

const createCategory = async (categoryData) => {
  try {
    const { name, parentId, description, priority, images } = categoryData;

    // Validate parent ID
    if (parentId && mongoose.Types.ObjectId.isValid(parentId)) {
      const parentExists = await Category.exists({ _id: parentId });
      if (!parentExists) {
        throw new Error("Danh mục cha không tồn tại");
      }
    }

    // Create new category
    const newCategory = new Category({
      name,
      parentId: parentId && mongoose.Types.ObjectId.isValid(parentId) ? parentId : null,
      description,
      images: images,
      priority: priority || 0,
    });

    const savedCategory = await newCategory.save();

    return savedCategory;
  } catch (error) {
    throw new Error(`Failed to create category: ${error.message}`);
  }
};

const getCategoryById = async (categoryId) => {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new Error("Invalid category ID");
  }
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new Error("Category not found");
    }
    return category;
  } catch (error) {
    throw new Error(`Lỗi khi lấy danh mục: ${error.message}`);
  }
};

const updateCategory = async (categoryId, updateData) => {
  try {
    const { name, parentId, description, priority, images } = updateData;

    const category = await Category.findById(categoryId);
    if (!category) {
      throw new Error("Danh mục không tồn tại");
    }

    const dataToUpdate = {};

    if (name !== undefined) dataToUpdate.name = name;
    if (description !== undefined) dataToUpdate.description = description;
    if (priority !== undefined) dataToUpdate.priority = priority;

    if (images && Array.isArray(images) && images.length > 0) {
      dataToUpdate.images = images;
    }

    if (parentId !== undefined) {
      if (parentId === categoryId) {
        throw new Error("Không thể đặt danh mục làm cha của chính nó");
      }

      if (parentId && mongoose.Types.ObjectId.isValid(parentId)) {
        const parentExists = await Category.exists({ _id: parentId });
        if (!parentExists) {
          throw new Error("Danh mục cha không tồn tại");
        }

        let currentParent = parentId;
        while (currentParent) {
          if (currentParent.toString() === categoryId) {
            throw new Error("Thao tác này sẽ tạo ra chu trình trong cấu trúc phân cấp danh mục");
          }
          const parent = await Category.findById(currentParent, "parentId");
          if (!parent) break;
          currentParent = parent.parentId;
        }

        dataToUpdate.parentId = parentId;
      } else {
        dataToUpdate.parentId = null;
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(categoryId, dataToUpdate, { new: true });
    return updatedCategory;
  } catch (error) {
    throw new Error(`Failed to update category: ${error.message}`);
  }
};

// Lấy tất cả ID của danh mục con (bao gồm cả cháu, chắt...) của một danh mục cha
const getAllChildCategoryIds = async (categoryId) => {
  try {
    // Khởi tạo mảng kết quả với ID của danh mục cha
    const allCategoryIds = [categoryId];

    // Hàm đệ quy để tìm tất cả con cháu
    const findChildren = async (parentId) => {
      // Tìm tất cả danh mục con trực tiếp
      const childCategories = await Category.find({ parentId });

      // Nếu không có danh mục con, dừng đệ quy
      if (childCategories.length === 0) return;

      // Thêm ID của các danh mục con vào kết quả
      for (const child of childCategories) {
        allCategoryIds.push(child._id.toString());
        // Tìm tiếp các con của con (cháu)
        await findChildren(child._id);
      }
    };

    // Bắt đầu tìm kiếm đệ quy
    await findChildren(categoryId);

    return allCategoryIds;
  } catch (error) {
    throw new ApiError(500, "Lỗi khi lấy danh mục con");
  }
};

module.exports = {
  getCategories,
  getCategoryTree,
  hasChildCategories,
  hasProducts,
  getProductCountsByCategories,
  deleteCategory,
  createCategory,
  getCategoryById,
  updateCategory,
  getAllChildCategoryIds,
};
