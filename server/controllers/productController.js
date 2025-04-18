const { response } = require("express");
const Product = require("../models/product");
const slugify = require("slugify");
const { default: mongoose } = require("mongoose");
const qs = require("qs");
const { deleteFileCloudinary, uploadMultipleFiles } = require("../services/fileService");

// Get all products
const getAllProducts = async (req, res) => {
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

    // 4. Thực hiện query với pagination và sort
    const products = await Product.find(query)
      .populate("categoryId", "name slug") // Liên kết với collection Categories
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select("-__v"); // Loại bỏ field version

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

// Create product
const createProduct = async (req, res) => {
  try {
    const parsedBody = qs.parse(req.body);
    // console.log("req.body", req.body); // trước khi parse
    // console.log("parsedBody", parsedBody); // sau khi parse

    const { name, description, categoryId, brand, variants, tags, isActive } = parsedBody;
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

    // Kiểm tra categoryId có tồn tại
    const categoryExists = await mongoose.model("Category").findById(categoryId);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Danh mục không tồn tại",
      });
    }
    // Upload nhiều file lên Cloudinary
    const uploadResults = await uploadMultipleFiles(files, "ecommerce/product");
    const imageUrls = uploadResults.map((file) => file.url);

    // Tạo sản phẩm mới
    const newProduct = new Product({
      name,
      slug,
      description,
      categoryId,
      brand,
      variants,
      images: imageUrls,
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

// Update product
const updateProduct = async (req, res) => {
  try {
    const { pid } = req.params;
    const parsedBody = qs.parse(req.body);
    // console.log("req.body", req.body); // trước khi parse
    // console.log("parsedBody", parsedBody); // sau khi parse

    const { name, description, categoryId, brand, variants, tags, isActive, deletedImages } = parsedBody;

    // Tạo slug từ tên sản phẩm
    const slug = slugify(name, {
      lower: true,
      strict: true,
      locale: "vi",
    });

    // Kiểm tra categoryId có tồn tại
    const categoryExists = await mongoose.model("Category").findById(categoryId);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Danh mục không tồn tại",
      });
    }

    let imageUrls = "";

    if (req?.files && req?.files?.images) {
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

      // Upload nhiều file lên Cloudinary
      const uploadResults = await uploadMultipleFiles(files, "ecommerce/product");
      imageUrls = uploadResults.map((file) => file.url);
    }

    // Tạo sản phẩm mới
    const newProduct = {
      name,
      slug,
      description,
      categoryId,
      brand,
      variants,
      tags: tags || [],
      isActive: isActive !== undefined ? isActive : true,
    };
    // 1. XÓA ẢNH trên Cloudinary nếu có
    if (deletedImages && deletedImages.length > 0) {
      // for (const imageUrl of deletedImages) {
      //   // Lấy public_id từ URL
      //   const segments = imageUrl.split("/");
      //   const publicIdWithExtension = segments.slice(-3).join("/"); // vd: folder/image.jpg
      //   const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, ""); // bỏ đuôi .jpg

      //   try {
      //     const result = await cloudinary.uploader.destroy(publicId);
      //     console.log("result", result);
      //     console.log(`Đã xóa ảnh: ${publicId}`);
      //   } catch (err) {
      //     console.error(`Không thể xoá ảnh ${publicId}:`, err.message);
      //   }
      // }
      const result = await deleteFileCloudinary(deletedImages);

      // 2. Cập nhật database: loại bỏ các ảnh đã xoá
      await Product.findByIdAndUpdate(pid, {
        $pull: { images: { $in: deletedImages } },
      });
    }
    // Nếu có ảnh thì mới thêm $push vào updateFields
    if (imageUrls && imageUrls.length > 0) {
      newProduct.$push = { images: { $each: imageUrls } }; // Dùng $each để thêm nhiều phần tử
    }
    // console.log("newProduct", newProduct);

    const product = await Product.findByIdAndUpdate(pid, newProduct, { new: true });
    console.log("first", product);

    res.status(200).json({
      success: true,
      message: "Sửa sản phẩm thành công",
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

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.pid;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    // 1. Xóa các ảnh từ product.images
    if (product.images && product.images.length > 0) {
      // for (const imageUrl of product.images) {
      //   const segments = imageUrl.split("/");
      //   const publicIdWithExtension = segments.slice(-2).join("/"); // vd: folder/image.jpg
      //   const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, ""); // bỏ đuôi .jpg

      //   try {
      //     await cloudinary.uploader.destroy(publicId);
      //     console.log(`Đã xóa ảnh: ${publicId}`);
      //   } catch (err) {
      //     console.error(`Không thể xoá ảnh ${publicId}:`, err.message);
      //   }
      // }
      const result = await deleteFileCloudinary(product.images);
    }

    // 2. Xoá sản phẩm khỏi database
    const deletedProduct = await Product.findByIdAndDelete(productId);

    return res.status(200).json({
      success: true,
      message: "Xóa sản phẩm thành công",
      data: deletedProduct,
    });
  } catch (error) {
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

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).json({
        success: false,
        message: "ID sản phẩm không hợp lệ",
      });
    }

    // Find product and populate category
    const product = await Product.findById(pid).populate("categoryId", "name slug").select("-__v");

    // Check if product exists
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    // Kiểm tra xem sản phẩm có hoạt động không (trừ khi người dùng là quản trị viên)
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

// Get all products
// const getAllProducts2 = asyncHandler(async (req, res) => {
//   const queries = {
//     ...req.query,
//   };
//   // Tách các trường đặc biệt ra khỏi queries
//   const excludeFields = ["page", "limit", "sort", "fields"];
//   excludeFields.forEach((field) => delete queries[field]);
//   // Format lại các operators cho đúng cú pháp mongoose
//   let queryString = JSON.stringify(queries);
//   queryString = queryString.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);
//   const formatedQueryString = JSON.parse(queryString);

//   if (queries?.title) formatedQueryString.title = { $regex: queries.title, $options: "i" };
//   let queryCommand = Product.find(formatedQueryString);
//   queryCommand
//     .then(async (response) => {
//       const count = await Product.find(formatedQueryString).countDocuments();
//       return res.status(200).json({
//         success: response ? true : false,
//         data: response ? response : "Cannot get products",
//         total: count,
//       });
//     })
//     .catch((err) => {
//       throw new Error(err);
//     });
// });

// const uploadSingleFile = async (req, res) => {
//   try {
//     // Kiểm tra xem có file được upload không
//     if (!req.files || !req.files.image) {
//       return res.status(400).json({
//         success: false,
//         message: "Vui lòng upload một file ảnh",
//       });
//     }

//     const file = req.files.image;

//     // Kiểm tra định dạng file
//     const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
//     if (!allowedTypes.includes(file.mimetype)) {
//       return res.status(400).json({
//         success: false,
//         message: "Chỉ chấp nhận file JPEG, JPG hoặc PNG",
//       });
//     }

//     // Gọi service để upload lên Cloudinary
//     const uploadResult = await uploadSingleFile(file);

//     // Trả về kết quả
//     res.status(200).json({
//       success: true,
//       message: "Upload ảnh thành công",
//       data: uploadResult,
//     });
//   } catch (error) {
//     console.error("Upload error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Lỗi khi upload ảnh",
//       error: error.message,
//     });
//   }
// };

// const uploadMultipleImages = async (req, res) => {
//   try {
//     console.log(req.files);
//     if (!req.files || !req.files.image) {
//       return res.status(400).json({
//         success: false,
//         message: "Vui lòng upload ít nhất một file ảnh",
//       });
//     }

//     // Chuyển thành mảng nếu chỉ upload 1 file
//     const files = Array.isArray(req.files.image) ? req.files.image : [req.files.image];

//     // Kiểm tra định dạng tất cả file
//     const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
//     const invalidFiles = files.filter((file) => !allowedTypes.includes(file.mimetype));
//     if (invalidFiles.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Chỉ chấp nhận file JPEG, JPG hoặc PNG",
//       });
//     }

//     // Upload nhiều file lên Cloudinary
//     const uploadResults = await uploadMultipleFiles(files);

//     res.status(200).json({
//       success: true,
//       message: "Upload nhiều ảnh thành công",
//       data: uploadResults,
//     });
//   } catch (error) {
//     console.error("Multiple upload error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Lỗi khi upload nhiều ảnh",
//       error: error.message,
//     });
//   }
// };

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  // getAllProducts2,
  // uploadSingleFile,
  // uploadMultipleImages,
};
