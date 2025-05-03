const Product = require("../models/product");
const mongoose = require("mongoose");
const slugify = require("slugify");

/**
 * Tạo sản phẩm mới
 * @param {Object} productData Dữ liệu sản phẩm
 * @returns {Promise<Object>} Sản phẩm đã tạo
 */
const createProduct = async (productData) => {
  try {
    // Tạo slug từ tên sản phẩm
    if (!productData.slug && productData.name) {
      productData.slug = slugify(productData.name, {
        lower: true,
        strict: true,
      });
    }

    // Kiểm tra SKU cho tất cả các biến thể
    if (productData.variants && productData.variants.length > 0) {
      for (const variant of productData.variants) {
        if (!variant.sku) {
          throw new Error("SKU is required for all variants");
        }
      }
    }

    const newProduct = new Product(productData);
    await newProduct.save();
    return newProduct;
  } catch (error) {
    throw error;
  }
};

/**
 * Cập nhật sản phẩm
 * @param {String} productId ID sản phẩm
 * @param {Object} updateData Dữ liệu cập nhật
 * @returns {Promise<Object>} Sản phẩm đã cập nhật
 */
const updateProduct = async (productId, updateData) => {
  try {
    // Tạo slug mới nếu tên thay đổi và không cung cấp slug
    if (updateData.name && !updateData.slug) {
      updateData.slug = slugify(updateData.name, {
        lower: true,
        strict: true,
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Cập nhật thông tin sản phẩm
    Object.keys(updateData).forEach((key) => {
      // Xử lý trường hợp đặc biệt: variants
      if (key === "variants" && Array.isArray(updateData.variants)) {
        // Nếu variants được cung cấp, thay thế hoàn toàn array hiện có
        product.variants = updateData.variants;
      } else {
        product[key] = updateData[key];
      }
    });

    await product.save();
    return product;
  } catch (error) {
    throw error;
  }
};

/**
 * Xóa sản phẩm
 * @param {String} productId ID sản phẩm
 * @returns {Promise<Object>} Sản phẩm đã xóa
 */
const deleteProduct = async (productId) => {
  try {
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy sản phẩm theo ID
 * @param {String} productId ID sản phẩm
 * @returns {Promise<Object>} Thông tin sản phẩm
 */
const getProductById = async (productId) => {
  try {
    const product = await Product.findById(productId).populate("categoryId", "name slug").select("-__v");

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  } catch (error) {
    throw error;
  }
};

/**
 * Cập nhật trạng thái sản phẩm (active/inactive)
 * @param {String} productId ID sản phẩm
 * @param {Boolean} isActive Trạng thái active
 * @returns {Promise<Object>} Sản phẩm đã cập nhật
 */
const updateProductStatus = async (productId, isActive) => {
  try {
    const product = await Product.findByIdAndUpdate(productId, { isActive }, { new: true });

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy các sản phẩm nổi bật
 * @param {Number} limit Số lượng sản phẩm muốn lấy
 * @returns {Promise<Array>} Danh sách sản phẩm nổi bật
 */
const getFeaturedProducts = async (limit = 8) => {
  try {
    const products = await Product.find({
      isActive: true,
      featured: true,
    })
      .limit(Number(limit))
      .populate("categoryId", "name slug")
      .select("-__v");

    return products;
  } catch (error) {
    throw error;
  }
};

/**
 * Thêm đánh giá cho sản phẩm
 * @param {String} productId ID sản phẩm
 * @param {Object} reviewData Dữ liệu đánh giá
 * @returns {Promise<Object>} Sản phẩm đã cập nhật
 */
const addReview = async (productId, userId, reviewData) => {
  try {
    const product = await Product.findById(productId);

    if (!product) {
      throw new Error("Product not found");
    }

    const { rating, comment, name } = reviewData;

    // Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
    const existingReviewIndex = product.reviews?.findIndex((r) => r.user?.toString() === userId.toString());

    if (existingReviewIndex >= 0) {
      // Cập nhật đánh giá hiện có
      product.reviews[existingReviewIndex].rating = rating;
      if (comment) product.reviews[existingReviewIndex].comment = comment;
    } else {
      // Thêm đánh giá mới
      const review = {
        user: userId,
        rating,
        comment: comment || "",
        name: name,
      };

      if (!product.reviews) {
        product.reviews = [];
      }

      product.reviews.push(review);
    }

    // Tính lại đánh giá trung bình
    product.averageRating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
    product.totalReviews = product.reviews.length;

    await product.save();
    return product;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  updateProductStatus,
  getFeaturedProducts,
  addReview,
};
