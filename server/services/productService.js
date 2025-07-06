const Product = require("../models/product");
const { generateSKU } = require("../utils/generateSKU");
const { deleteMultipleFilesService } = require("./fileService");

const createProduct = async (productData) => {
  try {
    // Xử lý SKU cho tất cả các biến thể
    if (productData.variants && productData.variants.length > 0) {
      for (const variant of productData.variants) {
        // Tạo SKU tự động nếu chưa có
        if (!variant.sku) {
          variant.sku = generateSKU(
            productData.productType || "sản phẩm",
            productData.name,
            productData.brand,
            variant.size,
            variant.color
          );
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

const updateProduct = async (productId, updateData) => {
  try {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Sản phẩm không tồn tại");
    }

    // Cập nhật thông tin sản phẩm
    Object.keys(updateData).forEach((key) => {
      // Xử lý trường hợp đặc biệt: variants
      if (key === "variants" && Array.isArray(updateData.variants)) {
        // Xử lý SKU cho các biến thể
        updateData.variants.forEach((variant) => {
          if (!variant.sku) {
            variant.sku = generateSKU(
              updateData.productType || product.productType || "sản phẩm",
              updateData.name || product.name,
              updateData.brand || product.brand,
              variant.size,
              variant.color
            );
          }
        });
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
 */
const deleteProduct = async (productId) => {
  try {
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      throw new Error("Sản phẩm không tồn tại");
    }

    if (product.images && product.images.length > 0) {
      const imagesToDelete = product.images;
      if (imagesToDelete.length > 0) {
        await deleteMultipleFilesService(imagesToDelete);
      }
    }

    return product;
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy sản phẩm theo ID
 */
const getProductById = async (productId) => {
  try {
    const product = await Product.findById(productId).populate("categoryId", "name").select("-__v");

    if (!product) {
      throw new Error("Sản phẩm không tồn tại");
    }

    return product;
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy các sản phẩm nổi bật
 */
const getFeaturedProducts = async (limit = 8, page = 1) => {
  try {
    const limitNumber = Number(limit);
    const pageNumber = Number(page);
    const skip = (pageNumber - 1) * limitNumber;

    const products = await Product.find({
      featured: true,
    })
      .skip(skip)
      .limit(limitNumber)
      .populate("categoryId", "name")
      .select("-__v");

    return products;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  getFeaturedProducts,
};
