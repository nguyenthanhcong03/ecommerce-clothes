const slugify = require("slugify");
const Category = require("../models/category");

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    return res.status(200).json({
      success: categories ? true : false,
      message: categories ? "Get all categories successfully" : "Cannot get categories",
      categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const createCategory = async (req, res) => {
  try {
    console.log("req", req.body);
    // // Lấy dữ liệu từ request body
    const { name, parentId, description, image, isActive, priority } = req.body;
    // console.log("2");
    // Tạo slug từ tên sản phẩm
    const slug = slugify(name, {
      lower: true,
      strict: true,
      locale: "vi", // Hỗ trợ tiếng Việt
    });
    console.log("slug", slug);
    // console.log("3");

    // Kiểm tra các trường bắt buộc
    if (!name) {
      return res.status(400).json({ message: "Tên và slug là bắt buộc" });
    }

    // Kiểm tra xem slug đã tồn tại chưa
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return res.status(400).json({ message: "Slug đã tồn tại" });
    }

    // Tạo instance mới của Category
    const newCategory = new Category({
      name,
      slug,
      parentId: parentId || null, // Nếu không có parentId thì để null
      description,
      image,
      isActive: isActive !== undefined ? isActive : true, // Mặc định là true
      priority: priority || 0, // Mặc định là 0
    });
    console.log(newCategory);

    // Lưu vào database
    await newCategory.save();

    // Trả về response thành công
    res.status(201).json(newCategory);
  } catch (error) {
    // Xử lý lỗi server
    res.status(500).json({ message: "Lỗi server", error });
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
    // Xử lý lỗi server
    res.status(500).json({ message: "Lỗi server", error });
  }
};

module.exports = { getAllCategories, createCategory, updateCategoryById };
