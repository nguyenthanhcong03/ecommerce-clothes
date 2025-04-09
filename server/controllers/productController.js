const { response } = require("express");
const Product = require("../models/product");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");

const createProduct = asyncHandler(async (req, res) => {
  if (Object.keys(req.body).length === 0) {
    throw new Error("Missing input");
  }
  if (req.body && req.body.title) {
    req.body.slug = slugify(req.body.title.trim());
  }
  const product = await Product.create(req.body);
  return res.status(200).json({
    success: product ? true : false,
    message: product ? "Product created" : "Product not created",
  });
});

const getProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const product = await Product.findById(pid);
  return res.status(200).json({
    success: product ? true : false,
    message: product ? product : "Cannot get product",
  });
});

const createProduct2 = async (req, res) => {
  try {
    const { name, description, categoryId, brand, variants, images, tags, isActive } = req.body;

    // Tạo slug từ tên sản phẩm
    const slug = slugify(name, {
      lower: true,
      strict: true,
      locale: "vi", // Hỗ trợ tiếng Việt
    });

    // Kiểm tra categoryId có tồn tại
    const categoryExists = await mongoose.model("Category").findById(categoryId);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Danh mục không tồn tại",
      });
    }

    // Tạo sản phẩm mới
    const newProduct = new Product({
      name,
      slug,
      description,
      categoryId,
      brand,
      variants,
      images,
      tags: tags || [],
      isActive: isActive !== undefined ? isActive : true,
    });

    // Lưu vào database
    const savedProduct = await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Tạo sản phẩm thành công",
      data: savedProduct,
    });
  } catch (error) {
    // Xử lý lỗi duplicate key (slug hoặc sku)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Sản phẩm với slug hoặc SKU đã tồn tại",
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

const getAllProducts = asyncHandler(async (req, res) => {
  const queries = {
    ...req.query,
  };
  // Tách các trường đặc biệt ra khỏi queries
  const excludeFields = ["page", "limit", "sort", "fields"];
  excludeFields.forEach((field) => delete queries[field]);
  // Format lại các operators cho đúng cú pháp mongoose
  let queryString = JSON.stringify(queries);
  queryString = queryString.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);
  const formatedQueryString = JSON.parse(queryString);

  if (queries?.title) formatedQueryString.title = { $regex: queries.title, $options: "i" };
  let queryCommand = Product.find(formatedQueryString);
  queryCommand
    .then(async (response) => {
      const count = await Product.find(formatedQueryString).countDocuments();
      return res.status(200).json({
        success: response ? true : false,
        data: response ? response : "Cannot get products",
        total: count,
      });
    })
    .catch((err) => {
      throw new Error(err);
    });
});

const getAllProducts2 = async (req, res) => {
  try {
    // 1. Fav lấy các query parameters từ request
    const {
      page = 1, // Trang mặc định là 1
      limit = 10, // Số sản phẩm mỗi trang mặc định là 10
      sortBy = "createdAt", // Sắp xếp mặc định theo ngày tạo
      order = "desc", // Thứ tự mặc định giảm dần
      search, // Từ khóa tìm kiếm
      category, // Lọc theo danh mục
      brand, // Lọc theo thương hiệu
      minPrice, // Giá tối thiểu
      maxPrice, // Giá tối đa
      size, // Lọc theo kích cỡ
      color, // Lọc theo màu sắc
      isActive = true, // Mặc định chỉ lấy sản phẩm đang hoạt động
    } = req.query;

    // 2. Xây dựng query
    let query = { isActive };

    // Search theo tên hoặc mô tả
    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }];
    }

    // Filter theo category
    if (category) {
      query.categoryId = category;
    }

    // Filter theo brand
    if (brand) {
      query.brand = brand;
    }

    // Filter theo giá (lấy từ variants)
    if (minPrice || maxPrice) {
      query["variants.price"] = {};
      if (minPrice) query["variants.price"].$gte = Number(minPrice);
      if (maxPrice) query["variants.price"].$lte = Number(maxPrice);
    }

    // Filter theo size
    if (size) {
      query["variants.size"] = size;
    }

    // Filter theo color
    if (color) {
      query["variants.color"] = color;
    }

    // 3. Tính tổng số documents
    const total = await Product.countDocuments(query);
    console.log("check total", total);

    // 4. Thực hiện query với pagination và sort
    const products = await Product.find(query)
      // .populate("categoryId", "name slug") // Liên kết với collection Categories
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select("-__v"); // Loại bỏ field version

    console.log("check products", products);

    // 5. Tạo response
    const response = {
      success: true,
      data: products,
      pagination: {
        current: Number(page),
        pageSize: Number(limit),
        total: total,
        totalPages: Math.ceil(total / limit),
      },
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const updateProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  if (req.body && req.body.title) {
    req.body.slug = slugify(req.body.title.trim());
  }
  const product = await Product.findByIdAndUpdate(pid, req.body, { new: true });
  return res.status(200).json({
    success: product ? true : false,
    message: product ? product : "Cannot update product",
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const product = await Product.findByIdAndDelete(pid);
  return res.status(200).json({
    success: product ? true : false,
    message: product ? product : "Cannot delete product",
  });
});

const uploadImageProduct = async () => {};

module.exports = {
  createProduct,
  getProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getAllProducts2,
  createProduct2,
  uploadImageProduct,
};
