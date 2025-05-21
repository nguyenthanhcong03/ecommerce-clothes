const slugify = require("slugify");
const Category = require("../models/category");
const qs = require("qs");
const { formatImagesForDB } = require("../services/fileService");
const { default: mongoose } = require("mongoose");
const categoryService = require("../services/categoryService");

const getAllCategories = async (req, res) => {
  try {
    const { page, limit, sortBy, order, search, parentId } = req.query;

    const result = await categoryService.getCategories({
      page,
      limit,
      sortBy,
      order,
      search,
      parentId,
    });

    const response = {
      success: true,
      categories: result.categories,
      pagination: result.pagination,
    };

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
    const categoryData = req.body;

    if (!categoryData.images || !Array.isArray(categoryData.images) || categoryData.images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp ít nhất một URL ảnh",
      });
    }

    // Create category using service
    const savedCategory = await categoryService.createCategory(categoryData);

    res.status(201).json({
      success: true,
      message: "Tạo danh mục thành công",
      data: savedCategory,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Danh mục với slug này đã tồn tại",
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

const updateCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Update category data
    try {
      const updatedCategory = await categoryService.updateCategory(id, updateData);

      return res.status(200).json({
        success: true,
        message: "Cập nhật danh mục thành công",
        data: updatedCategory,
      });
    } catch (err) {
      if (err.message === "Category not found") {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy danh mục",
        });
      }
      throw err;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const category = await categoryService.getCategoryById(id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy danh mục",
        });
      }

      return res.status(200).json({
        success: true,
        data: category,
      });
    } catch (err) {
      if (err.message === "Invalid category ID") {
        return res.status(400).json({
          success: false,
          message: "ID danh mục không hợp lệ",
        });
      }
      throw err;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const hasChildren = await categoryService.hasChildCategories(id);
    if (hasChildren) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa danh mục đang có danh mục con",
      });
    }

    const hasProducts = await categoryService.hasProducts(id);
    if (hasProducts) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa danh mục đang có sản phẩm",
      });
    }

    try {
      const deletedCategory = await categoryService.deleteCategory(id);

      return res.status(200).json({
        success: true,
        message: "Xóa danh mục thành công",
        data: deletedCategory,
      });
    } catch (err) {
      if (err.message === "Category not found") {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy danh mục",
        });
      }
      throw err;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

const getTreeCategories = async (req, res) => {
  try {
    const categoriesTree = await categoryService.getCategoryTree();

    return res.status(200).json({
      success: true,
      data: categoriesTree,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategoryById,
  getCategoryById,
  deleteCategory,
  getTreeCategories,
};
