const { response } = require("express");
const Product = require("../models/product");
const productService = require("../services/productService");
const slugify = require("slugify");
const { default: mongoose } = require("mongoose");

// Get all products
const getAllProducts = async (req, res) => {
  try {
    // Destructure query parameters with defaults
    const {
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "desc",
      search = "",
      category = "",
      brand = "",
      minPrice = "",
      maxPrice = "",
      featured = "",
      isActive = "true",
      tags = "",
      size = "",
      color = "",
      rating = "", // Thêm trường rating
      inStock = "", // Thêm trường inStock
    } = req.query;

    // Convert page and limit to integers
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    // Calculate skip for pagination
    const skip = (pageNumber - 1) * limitNumber;

    // Build filter object
    const filter = {};

    // Active products filter (default to showing only active products)
    if (isActive !== "") {
      filter.isActive = isActive === "true";
    }

    // Category filter
    if (category) {
      filter.categoryId = category;
    }

    // Brand filter
    if (brand) {
      // If multiple brands are provided as comma-separated values
      if (brand.includes(",")) {
        filter.brand = { $in: brand.split(",") };
      } else {
        filter.brand = brand;
      }
    }

    // Featured products filter
    if (featured !== "") {
      filter.featured = featured === "true";
    }

    // Price range filter
    const priceFilter = {};
    if (minPrice !== "") {
      priceFilter.$gte = parseFloat(minPrice);
    }
    if (maxPrice !== "") {
      priceFilter.$lte = parseFloat(maxPrice);
    }

    if (Object.keys(priceFilter).length > 0) {
      filter["variants.price"] = priceFilter;
    }

    // Tags filter
    if (tags) {
      filter.tags = { $in: tags.split(",") };
    }

    // Size filter - chấp nhận nhiều size ngăn cách bởi dấu phẩy
    if (size) {
      if (size.includes(",")) {
        filter["variants.size"] = { $in: size.split(",") };
      } else {
        filter["variants.size"] = size;
      }
    }

    // Color filter - chấp nhận nhiều color ngăn cách bởi dấu phẩy
    if (color) {
      if (color.includes(",")) {
        filter["variants.color"] = { $in: color.split(",") };
      } else {
        filter["variants.color"] = color;
      }
    }

    // Rating filter - lọc sản phẩm có rating >= giá trị đã cho
    if (rating !== "") {
      filter.averageRating = { $gte: parseFloat(rating) };
    }

    // InStock filter - chỉ hiển thị sản phẩm còn hàng
    if (inStock !== "") {
      if (inStock === "true") {
        filter["variants.countInStock"] = { $gt: 0 };
      } else if (inStock === "false") {
        filter["variants.countInStock"] = { $lte: 0 };
      }
    }

    // Text search if provided
    if (search) {
      filter.$or = [
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

    // Determine sort options
    const sortOptions = {};

    // Handle special sorts
    if (sort === "price") {
      // Sort by the lowest price in the variants
      sortOptions["variants.price"] = order === "asc" ? 1 : -1;
    } else if (sort === "popularity") {
      // Sort by sales count
      sortOptions.salesCount = order === "asc" ? 1 : -1;
    } else if (sort === "rating") {
      // Sort by average rating
      sortOptions.averageRating = order === "asc" ? 1 : -1;
    } else {
      // Default sorting by any field
      sortOptions[sort] = order === "asc" ? 1 : -1;
    }

    // Execute query with pagination
    const products = await Product.find(filter)
      .populate("categoryId", "name slug") // Populate category data
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber)
      .lean(); // Convert to plain JS objects for better performance

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(filter);

    // Calculate total pages
    const totalPages = Math.ceil(totalProducts / limitNumber);

    return res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          totalProducts,
          totalPages,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1,
        },
        filters: {
          search: search || null,
          category: category || null,
          brand: brand || null,
          minPrice: minPrice || null,
          maxPrice: maxPrice || null,
          featured: featured || null,
          isActive: isActive || null,
          size: size || null,
          color: color || null,
          rating: rating || null,
          inStock: inStock || null,
          tags: tags || null,
        },
      },
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

    const newProduct = await productService.createProduct(productData);

    res.status(201).json({
      success: true,
      message: "Tạo sản phẩm thành công",
      data: newProduct,
    });
  } catch (error) {
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

    try {
      const product = await productService.getProductById(pid);

      if (!product.isActive && (!req.user || req.user.role !== "admin")) {
        return res.status(403).json({
          success: false,
          message: "Sản phẩm không khả dụng",
        });
      }

      res.status(200).json({
        success: true,
        data: product,
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
      isActive: true,
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
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Cần cung cấp từ khóa tìm kiếm",
      });
    }

    const options = {
      page,
      limit,
    };

    const result = await productService.searchProducts(q, options);

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
    const { limit = 8 } = req.query;

    const featuredProducts = await productService.getFeaturedProducts(limit);

    res.status(200).json({
      success: true,
      data: featuredProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Update product status
const updateProductStatus = async (req, res) => {
  try {
    const { pid } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái sản phẩm không được cung cấp",
      });
    }

    try {
      const product = await productService.updateProductStatus(pid, isActive);

      res.status(200).json({
        success: true,
        message: `Sản phẩm đã được ${isActive ? "kích hoạt" : "vô hiệu hóa"}`,
        data: product,
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

// Add product review
const addProductReview = async (req, res) => {
  try {
    const { pid } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    if (!rating) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đánh giá",
      });
    }

    const reviewData = {
      rating,
      comment: comment || "",
      name: `${req.user.firstName} ${req.user.lastName}`,
    };

    try {
      await productService.addReview(pid, userId, reviewData);

      res.status(201).json({
        success: true,
        message: "Đánh giá sản phẩm thành công",
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

// Get product reviews
const getProductReviews = async (req, res) => {
  try {
    const { pid } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const product = await Product.findById(pid).select("reviews averageRating totalReviews");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    const reviews = product.reviews || [];
    const startIdx = (page - 1) * limit;
    const endIdx = page * limit;

    const paginatedReviews = reviews.slice(startIdx, endIdx);

    res.status(200).json({
      success: true,
      data: {
        reviews: paginatedReviews,
        averageRating: product.averageRating || 0,
        totalReviews: product.totalReviews || 0,
      },
      pagination: {
        current: Number(page),
        pageSize: Number(limit),
        total: reviews.length,
        totalPages: Math.ceil(reviews.length / limit),
      },
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
      isActive: true,
    })
      .limit(Number(limit))
      .populate("categoryId", "name slug")
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

// Get product variants
const getProductVariants = async (req, res) => {
  try {
    const { pid } = req.params;

    const product = await Product.findById(pid).select("variants");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    res.status(200).json({
      success: true,
      data: product.variants || [],
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

// Get products by brand
const getProductsByBrand = async (req, res) => {
  try {
    const { brand } = req.params;
    const { page = 1, limit = 10, sortBy = "createdAt", order = "desc" } = req.query;

    const query = {
      brand: { $regex: brand, $options: "i" },
      isActive: true,
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

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  getProductsByCategory,
  searchProducts,
  getFeaturedProducts,
  updateProductStatus,
  addProductReview,
  getProductReviews,
  getRelatedProducts,
  getProductVariants,
  getProductVariantById,
  getProductsByBrand,
};
