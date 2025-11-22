const { response } = require("express");
const Product = require("../models/product");
const productService = require("../services/productService");
const categoryService = require("../services/categoryService");
const { default: mongoose } = require("mongoose");

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const {
      page,
      limit,
      search,
      category,
      minPrice,
      maxPrice,
      tags,
      size,
      color,
      rating,
      stockStatus,
      featured,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const skip = (pageNumber - 1) * limitNumber;

    // Xây dựng query động dựa trên các tham số lọc
    const query = {}; // Lọc theo danh mục (bao gồm cả danh mục con)
    if (category) {
      // Nếu chỉ có một danh mục
      try {
        // Lấy tất cả ID danh mục con
        const allCategoryIds = await categoryService.getAllChildCategoryIds(category);
        query.categoryId = { $in: allCategoryIds };
      } catch (error) {
        // Nếu có lỗi, chỉ sử dụng danh mục hiện tại
        console.error(`Error getting child categories:`, error.message);
        query.categoryId = category;
      }
    }

    // Lọc theo khoảng giá
    const priceFilter = {};
    if (minPrice || maxPrice) {
      if (minPrice) {
        priceFilter.$gte = parseFloat(minPrice);
      }

      if (maxPrice) {
        priceFilter.$lte = parseFloat(maxPrice);
      }
    }
    if (Object.keys(priceFilter).length > 0) {
      query["variants.price"] = priceFilter;
    }

    // Lọc theo tags
    if (tags) {
      // Hỗ trợ nhiều tags (dạng mảng)
      if (Array.isArray(tags)) {
        query.tags = { $in: tags };
      } else {
        query.tags = tags;
      }
    }

    // Lọc theo size
    if (size) {
      // Hỗ trợ nhiều size (dạng mảng)
      if (Array.isArray(size)) {
        query["variants.size"] = { $in: size };
      } else {
        query["variants.size"] = size;
      }
    }

    // Lọc theo color
    if (color) {
      // Hỗ trợ nhiều color (dạng mảng)
      if (Array.isArray(color)) {
        query["variants.color"] = { $in: color };
      } else {
        query["variants.color"] = color;
      }
    }

    // Rating filter - lọc sản phẩm có rating >= giá trị đã cho
    if (rating) {
      query.averageRating = { $gte: parseFloat(rating) };
    }

    // Lọc theo tình trạng hàng
    if (stockStatus && stockStatus !== "all") {
      if (stockStatus === "in_stock") {
        // Còn hàng: stock > 5
        query["variants.stock"] = { $gt: 5 };
      } else if (stockStatus === "low_stock") {
        // Sắp hết hàng: 0 < stock <= 5
        query["variants.stock"] = { $gt: 0, $lte: 5 };
      } else if (stockStatus === "out_of_stock") {
        // Hết hàng: stock = 0
        query["variants.stock"] = 0;
      }
    }

    // Lọc theo trạng thái nổi bật
    if (featured !== undefined) {
      query.featured = featured === "true" || featured === true;
    }

    // Text search if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];

      // Alternative: Use the text index if search term contains multiple words
      // if (search.includes(' ')) {
      //   filter.$text = { $search: search };
      // } else {
      //   filter.$or = [
      //     { name: { $regex: search, $options: 'i' } },
      //     { description: { $regex: search, $options: 'i' } }
      //   ];
      // }
    }

    const sort = {};

    if (sortBy === "price") {
      sort["variants.price"] = sortOrder === "asc" ? 1 : -1;
    } else if (sortBy === "popular") {
      sort.salesCount = sortOrder === "asc" ? 1 : -1;
    } else if (sortBy === "rating") {
      sort.averageRating = sortOrder === "asc" ? 1 : -1;
    } else {
      sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    }

    const response = await Product.find(query)
      .populate("categoryId", "name") // Populate category data
      .sort(sort)
      .skip(skip)
      .limit(limitNumber)
      .select("-__v")
      .lean(); // Convert to plain JS objects for better performance

    // const totalProducts = await Product.countDocuments(query);
    // const totalPages = Math.ceil(totalProducts / limitNumber);
    return res.status(200).json({
      success: true,
      data: {
        data: response,
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      },
      message: "Lấy danh sách sản phẩm thành công",
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};

// Create product
const createProduct = async (req, res) => {
  try {
    const productData = req.body;

    if (!productData.images || !Array.isArray(productData.images) || productData.images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp ít nhất một URL ảnh",
      });
    }

    // Kiểm tra danh mục tồn tại
    const categoryExists = await mongoose.model("Category").findById(productData.categoryId);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Danh mục không tồn tại",
      });
    }

    // Xử lý trường featured
    if (productData.featured !== undefined) {
      productData.featured = Boolean(productData.featured);
    }

    const newProduct = await productService.createProduct(productData);

    res.status(201).json({
      success: true,
      message: "Tạo sản phẩm thành công",
      data: newProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { pid } = req.params;
    const updateData = req.body;

    if (updateData.categoryId) {
      const categoryExists = await mongoose.model("Category").findById(updateData.categoryId);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: "Danh mục không tồn tại",
        });
      }
    }

    // Xử lý trường featured
    if (updateData.featured !== undefined) {
      updateData.featured = Boolean(updateData.featured);
    }

    // Update product data
    try {
      const updatedProduct = await productService.updateProduct(pid, updateData);

      return res.status(200).json({
        success: true,
        message: "Cập nhật sản phẩm thành công",
        data: updatedProduct,
      });
    } catch (err) {
      if (err.message === "Product not found") {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sản phẩm",
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

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.pid;

    try {
      const deletedProduct = await productService.deleteProduct(productId);

      return res.status(200).json({
        success: true,
        message: "Xóa sản phẩm thành công",
        data: deletedProduct,
      });
    } catch (err) {
      if (err.message === "Product not found") {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sản phẩm",
        });
      }
      throw err;
    }
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Get product by id
const getProductById = async (req, res) => {
  try {
    const { pid } = req.params;

    if (!mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).json({
        success: false,
        message: "ID sản phẩm không hợp lệ",
      });
    }

    const product = await productService.getProductById(pid);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 10, sortBy = "createdAt", order = "desc" } = req.query;

    const query = {
      categoryId,
    };

    const options = {
      page,
      limit,
      sortBy,
      order,
    };

    const result = await productService.getProducts(query, options);

    res.status(200).json({
      success: true,
      data: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Search products
const searchProducts = async (req, res) => {
  try {
    const { keyword, page = 1, limit = 10 } = req.query;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: "Cần cung cấp từ khóa tìm kiếm",
      });
    }

    const options = {
      page,
      limit,
    };

    const result = await productService.searchProducts(keyword, options);

    res.status(200).json({
      success: true,
      data: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Get featured products
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8, page = 1 } = req.query;

    const response = await productService.getFeaturedProducts(limit, page);
    res.status(200).json({
      success: true,
      data: {
        data: response,
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      },
      message: "Lấy sản phẩm nổi bật thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Get related products
const getRelatedProducts = async (req, res) => {
  try {
    const { pid } = req.params;
    const { limit = 4 } = req.query;

    const product = await Product.findById(pid);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    // Tìm các sản phẩm có cùng danh mục, nhưng không phải sản phẩm hiện tại
    const relatedProducts = await Product.find({
      categoryId: product.categoryId,
      _id: { $ne: pid },
    })
      .limit(Number(limit))
      .populate("categoryId", "name")
      .select("-__v");

    res.status(200).json({
      success: true,
      data: relatedProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Get product variant by ID
const getProductVariantById = async (req, res) => {
  try {
    const { pid, variantId } = req.params;

    const product = await Product.findById(pid);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    const variant = product.variants.id(variantId);

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy biến thể sản phẩm",
      });
    }

    res.status(200).json({
      success: true,
      data: variant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  getProductsByCategory,
  searchProducts,
  getFeaturedProducts,
  getRelatedProducts,
  getProductVariantById,
};
