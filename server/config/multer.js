const multer = require("multer");
const path = require("path");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

// Cấu hình lưu trữ cục bộ tạm thời cho tệp tải lên
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Cấu hình lưu trữ Cloudinary
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads", // Thư mục mặc định
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    transformation: [{ width: 1000, height: 1000, crop: "limit" }],
  },
});

// Định nghĩa hàm lọc tệp để xác thực loại tệp
const fileFilter = (req, file, cb) => {
  // Chỉ chấp nhận tệp hình ảnh
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận tệp hình ảnh!"), false);
  }
};

// Tạo uploader Multer với lưu trữ cục bộ cho tệp tạm thời
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Kích thước tệp tối đa 5MB
  },
  fileFilter: fileFilter,
});

// Tạo uploader Multer với lưu trữ Cloudinary
const cloudUpload = multer({
  storage: cloudinaryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Kích thước tệp tối đa 5MB
  },
  fileFilter: fileFilter,
});

// Tạo uploader Multer với lưu trữ bộ nhớ (cho tải lên dạng luồng)
const memoryStorage = multer.memoryStorage();
const memoryUpload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Kích thước tệp tối đa 5MB
  },
  fileFilter: fileFilter,
});

module.exports = {
  upload, // Cho lưu trữ cục bộ
  cloudUpload, // Cho tải lên trực tiếp đến Cloudinary
  memoryUpload, // Cho lưu trữ bộ nhớ (hữu ích khi xử lý trước khi tải lên)
};
