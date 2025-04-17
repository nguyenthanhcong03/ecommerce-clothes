const slugify = require("slugify");
const Category = require("../models/category");
const qs = require("qs");
const { uploadMultipleFiles } = require("../services/fileService");

const { response } = require("express");
const Product = require("../models/product");
const asyncHandler = require("express-async-handler");
const { default: mongoose } = require("mongoose");

const getAllCategories = async (req, res) => {
  try {
    // 1. Fav lấy các query parameters từ request
    const {
      page = 1, // Trang mặc định là 1
      limit = 10, // Số sản phẩm mỗi trang mặc định là 10
      sortBy = "createdAt", // Sắp xếp mặc định theo ngày tạo
      order = "desc", // Thứ tự mặc định giảm dần
      search, // Từ khóa tìm kiếm
      isActive = true, // Mặc định chỉ lấy sản phẩm đang hoạt động
    } = req.query;

    // 2. Xây dựng query
    let query = { isActive };

    // Search theo tên hoặc mô tả
    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }];
    }

    // 3. Tính tổng số documents
    const total = await Category.countDocuments(query);

    // 4. Thực hiện query với pagination và sort
    const categories = await Category.find(query)
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select("-__v"); // Loại bỏ field version

    // 5. Tạo response
    const response = {
      success: true,
      data: categories,
      pagination: {
        current: Number(page),
        pageSize: Number(limit),
        total: total,
        totalPages: Math.ceil(total / limit),
      },
    };
    // console.log(categories);
    // console.log("Page:", page, "Limit:", limit);

    res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const parsedBody = qs.parse(req.body);
    // console.log("req.body", req.body); // trước khi parse
    // console.log("parsedBody", parsedBody); // sau khi parse

    const { name, parentId, description, isActive, priority } = parsedBody;

    if (!req.files || !req.files.images) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng upload ít nhất một file ảnh",
      });
    }

    // Chuyển thành mảng nếu chỉ upload 1 file
    const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

    // Kiểm tra định dạng tất cả file
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    const invalidFiles = files.filter((file) => !allowedTypes.includes(file.mimetype));
    if (invalidFiles.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Chỉ chấp nhận file JPEG, JPG hoặc PNG",
      });
    }

    // Tạo slug từ tên sản phẩm
    const slug = slugify(name, {
      lower: true,
      strict: true,
      locale: "vi", // Hỗ trợ tiếng Việt
    });

    // Upload nhiều file lên Cloudinary
    const uploadResults = await uploadMultipleFiles(files, "ecommerce/category");
    const imageUrls = uploadResults.map((file) => file.url);
    // console.log("uploadResults", uploadResults);

    // // Kiểm tra xem slug đã tồn tại chưa
    // const existingCategory = await Category.findOne({ slug });
    // if (existingCategory) {
    //   return res.status(400).json({ message: "Slug đã tồn tại" });
    // }

    // Tạo instance mới của Category
    const newCategory = new Category({
      name,
      slug,
      parentId: parentId && mongoose.Types.ObjectId.isValid(parentId) ? parentId : null,
      description,
      images: imageUrls, // Lưu trữ URL ảnh trong mảng
      isActive: isActive !== undefined ? isActive : true, // Mặc định là true
      priority: priority || 0, // Mặc định là 0
    });

    console.log("newCategory", newCategory);
    // Lưu vào database
    const savedCategory = await newCategory.save();
    // const savedCategory = await Category.create(newCategory);
    console.log("savedCategory", savedCategory);

    // Trả về response thành công
    res.status(201).json({
      success: true,
      message: "Tạo danh mục thành công",
      data: savedCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error,
    });
  }
};

const updateCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.body && req.body.name) {
      req.body.slug = slugify(req.body.name.trim());
    }
    const category = await Category.findByIdAndUpdate(id, req.body, { new: true });
    return res.status(200).json({
      success: category ? true : false,
      message: category ? category : "Cannot update category",
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

module.exports = { getAllCategories, createCategory, updateCategoryById };
