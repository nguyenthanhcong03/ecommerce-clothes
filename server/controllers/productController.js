const { response } = require("express");
const Product = require("../models/product");
const slugify = require("slugify");
const { default: mongoose } = require("mongoose");
const qs = require("qs");
const { deleteFileCloudinary, uploadMultipleFiles, formatImagesForDB } = require("../services/hihiService");

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      size,
      color,
      isActive = true,
    } = req.query;

    let query = { isActive };

    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }];
    }

    if (category) {
      query.categoryId = category;
    }

    if (brand) {
      query.brand = brand;
    }

    if (minPrice || maxPrice) {
      query["variants.price"] = {};
      if (minPrice) query["variants.price"].$gte = Number(minPrice);
      if (maxPrice) query["variants.price"].$lte = Number(maxPrice);
    }

    if (size) {
      query["variants.size"] = size;
    }

    if (color) {
      query["variants.color"] = color;
    }

    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate("categoryId", "name slug")
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select("-__v");

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

// Create product
const createProduct = async (req, res) => {
  try {
    const parsedBody = qs.parse(req.body);
    const { name, description, categoryId, brand, variants, tags, isActive } = parsedBody;

    if (!req.files || !req.files.images) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng upload ít nhất một file ảnh",
      });
    }

    const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
    console.log("files", files);

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    const invalidFiles = files.filter((file) => !allowedTypes.includes(file.mimetype));
    if (invalidFiles.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Chỉ chấp nhận file JPEG, JPG hoặc PNG",
      });
    }

    const slug = slugify(name, {
      lower: true,
      strict: true,
      locale: "vi",
    });

    console.log("first");

    const categoryExists = await mongoose.model("Category").findById(categoryId);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Danh mục không tồn tại",
      });
    }

    const uploadResults = await uploadMultipleFiles(files, "ecommerce/product");
    const formattedImages = formatImagesForDB(uploadResults);

    // let parsedVariants = [];
    // if (variants && typeof variants === "string") {
    //   try {
    //     parsedVariants = JSON.parse(variants);

    //     parsedVariants.forEach((variant) => {
    //       if (variant.images && Array.isArray(variant.images)) {
    //         variant.images = variant.images.map((img) => {
    //           if (typeof img === "string") {
    //             return { url: img, public_id: "" };
    //           }
    //           return img;
    //         });
    //       } else {
    //         variant.images = [];
    //       }
    //     });
    //   } catch (error) {
    //     console.error("Invalid variants JSON:", error);
    //     parsedVariants = [];
    //   }
    // }

    const newProduct = new Product({
      name,
      slug,
      description,
      categoryId,
      brand,
      variants: variants || [],
      images: formattedImages,
      tags: tags || [],
      isActive: isActive !== undefined ? isActive : true,
    });

    const savedProduct = await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Tạo sản phẩm thành công",
      data: savedProduct,
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
    const parsedBody = qs.parse(req.body);

    const { name, description, categoryId, brand, variants, tags, isActive, deletedImages } = parsedBody;

    const slug = name
      ? slugify(name, {
          lower: true,
          strict: true,
          locale: "vi",
        })
      : undefined;

    if (categoryId) {
      const categoryExists = await mongoose.model("Category").findById(categoryId);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: "Danh mục không tồn tại",
        });
      }
    }

    const updateFields = {};
    if (name) updateFields.name = name;
    if (slug) updateFields.slug = slug;
    if (description) updateFields.description = description;
    if (categoryId) updateFields.categoryId = categoryId;
    if (brand) updateFields.brand = brand;
    if (tags) updateFields.tags = tags;
    if (isActive !== undefined) updateFields.isActive = isActive;

    // if (variants) {
    //   try {
    //     const parsedVariants = typeof variants === "string" ? JSON.parse(variants) : variants;

    //     parsedVariants.forEach((variant) => {
    //       if (variant.images && Array.isArray(variant.images)) {
    //         variant.images = variant.images.map((img) => {
    //           if (typeof img === "string") {
    //             return { url: img, public_id: "" };
    //           }
    //           return img;
    //         });
    //       }
    //     });

    //     updateFields.variants = parsedVariants;
    //   } catch (error) {
    //     console.error("Invalid variants JSON:", error);
    //   }
    // }

    if (deletedImages) {
      const imagesToDelete = Array.isArray(deletedImages) ? deletedImages : [deletedImages];

      if (imagesToDelete.length > 0) {
        const product = await Product.findById(pid);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy sản phẩm",
          });
        }

        const imagesToDeleteObjects = product.images.filter((img) => imagesToDelete.includes(img.url));

        await deleteFileCloudinary(imagesToDeleteObjects);

        await Product.findByIdAndUpdate(pid, {
          $pull: {
            images: { $in: imagesToDelete },
          },
        });
      }
    }

    if (req?.files && req?.files?.images) {
      const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      const invalidFiles = files.filter((file) => !allowedTypes.includes(file.mimetype));
      if (invalidFiles.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Chỉ chấp nhận file JPEG, JPG hoặc PNG",
        });
      }

      const uploadResults = await uploadMultipleFiles(files, "ecommerce/product");
      const formattedImages = formatImagesForDB(uploadResults);

      await Product.findByIdAndUpdate(pid, {
        $push: { images: { $each: formattedImages } },
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(pid, updateFields, { new: true }).populate(
      "categoryId",
      "name slug"
    );

    res.status(200).json({
      success: true,
      message: "Sửa sản phẩm thành công",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Update product error:", error);
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
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm.",
      });
    }

    if (product.images && product.images.length > 0) {
      await deleteFileCloudinary(product.images);
    }

    if (product.variants && product.variants.length > 0) {
      for (const variant of product.variants) {
        if (variant.images && variant.images.length > 0) {
          await deleteFileCloudinary(variant.images);
        }
      }
    }

    const deletedProduct = await Product.findByIdAndDelete(productId);

    return res.status(200).json({
      success: true,
      message: "Xóa sản phẩm thành công",
      data: deletedProduct,
    });
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

    const product = await Product.findById(pid).populate("categoryId", "name slug").select("-__v");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

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

    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate("categoryId", "name slug")
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select("-__v");

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        current: Number(page),
        pageSize: Number(limit),
        total: total,
        totalPages: Math.ceil(total / limit),
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

    const query = {
      $or: [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ],
      isActive: true,
    };

    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate("categoryId", "name slug")
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        current: Number(page),
        pageSize: Number(limit),
        total: total,
        totalPages: Math.ceil(total / limit),
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

// Get featured products
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const featuredProducts = await Product.find({
      isActive: true,
      isFeatured: true,
    })
      .limit(Number(limit))
      .populate("categoryId", "name slug")
      .select("-__v");

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

    const product = await Product.findByIdAndUpdate(pid, { isActive }, { new: true });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    res.status(200).json({
      success: true,
      message: `Sản phẩm đã được ${isActive ? "kích hoạt" : "vô hiệu hóa"}`,
      data: product,
    });
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

    const product = await Product.findById(pid);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    // Check if user already reviewed this product
    const existingReview = product.reviews?.find((r) => r.user.toString() === userId.toString());

    if (existingReview) {
      // Update existing review
      product.reviews.forEach((review) => {
        if (review.user.toString() === userId.toString()) {
          review.rating = rating;
          review.comment = comment || review.comment;
        }
      });
    } else {
      // Add new review
      const review = {
        user: userId,
        rating,
        comment: comment || "",
        name: `${req.user.firstName} ${req.user.lastName}`,
      };

      if (!product.reviews) {
        product.reviews = [];
      }

      product.reviews.push(review);
    }

    // Calculate average rating
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();

    res.status(201).json({
      success: true,
      message: "Đánh giá sản phẩm thành công",
    });
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

    const product = await Product.findById(pid).select("reviews rating");

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
        rating: product.rating || 0,
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
};
