const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const path = require("path");

/**
 * Upload một file đơn lẻ lên Cloudinary
 * @param {Object} file - Đối tượng file từ multer
 * @param {String} folder - Thư mục trong Cloudinary để lưu trữ (không bắt buộc)
 * @returns {Promise} - Trả về kết quả upload từ Cloudinary
 */
const uploadSingleFile = async (file, folder = "uploads") => {
  try {
    // Nếu file đến từ memory storage
    if (file.buffer) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: "auto",
            transformation: [
              { width: 1000, height: 1000, crop: "limit" },
              { quality: "auto" },
              { fetch_format: "auto" },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(file.buffer);
      });
    }

    // Nếu file có đường dẫn (từ disk storage)
    if (file.path) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: "auto",
        transformation: [{ width: 1000, height: 1000, crop: "limit" }, { quality: "auto" }, { fetch_format: "auto" }],
      });

      // Xóa file tạm nếu cần
      if (file.path.includes("uploads")) {
        fs.unlinkSync(file.path);
      }

      return result;
    }

    // Cho file từ multer-storage-cloudinary
    if (file.filename && file.public_id) {
      return {
        public_id: file.public_id,
        secure_url: file.path || file.secure_url,
        format: file.format,
        width: file.width,
        height: file.height,
      };
    }

    throw new Error("Định dạng file không hợp lệ");
  } catch (error) {
    console.error("Lỗi upload file:", error);
    throw error;
  }
};

/**
 * Upload nhiều files lên Cloudinary
 * @param {Array} files - Mảng các đối tượng file từ multer
 * @param {String} folder - Thư mục trong Cloudinary để lưu trữ (không bắt buộc)
 * @returns {Promise} - Trả về mảng kết quả upload từ Cloudinary
 */
const uploadMultipleFiles = async (files, folder = "uploads") => {
  try {
    const uploadPromises = files.map((file) => uploadSingleFile(file, folder));
    return Promise.all(uploadPromises);
  } catch (error) {
    console.error("Lỗi upload nhiều files:", error);
    throw error;
  }
};

/**
 * Xóa một file từ Cloudinary theo public_id hoặc URL
 * @param {String|Object} file - public_id, URL hoặc đối tượng file
 * @returns {Promise} - Trả về kết quả xóa từ Cloudinary
 */
const deleteFile = async (file) => {
  try {
    let publicId;

    if (typeof file === "string") {
      // Nếu đó là URL, trích xuất public_id
      if (file.includes("cloudinary.com")) {
        const urlParts = file.split("/");
        const filenameWithExtension = urlParts[urlParts.length - 1];
        publicId = filenameWithExtension.split(".")[0];

        // Nếu có cấu trúc thư mục trong URL
        const folderPath = urlParts.slice(urlParts.indexOf("upload") + 1, urlParts.length - 1).join("/");

        if (folderPath) {
          publicId = `${folderPath}/${publicId}`;
        }
      } else {
        // Đã là public_id
        publicId = file;
      }
    } else if (file && file.public_id) {
      // Là đối tượng kết quả Cloudinary
      publicId = file.public_id;
    } else {
      throw new Error("Tham chiếu file không hợp lệ");
    }

    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Lỗi xóa file:", error);
    throw error;
  }
};

/**
 * Xóa nhiều files từ Cloudinary
 * @param {Array} files - Mảng các public_ids, URLs hoặc đối tượng file
 * @returns {Promise} - Trả về mảng kết quả xóa từ Cloudinary
 */
const deleteMultipleFiles = async (files) => {
  try {
    const deletePromises = files.map((file) => deleteFile(file));
    return Promise.all(deletePromises);
  } catch (error) {
    console.error("Lỗi xóa nhiều files:", error);
    throw error;
  }
};

/**
 * Định dạng kết quả upload ảnh để lưu vào cơ sở dữ liệu
 * @param {Array} uploadResults - Kết quả từ uploadMultipleFiles
 * @returns {Array} - Mảng các đối tượng được định dạng cho MongoDB
 */
const formatImagesForDB = (uploadResults) => {
  return uploadResults.map((result) => ({
    url: result.secure_url,
    public_id: result.public_id,
  }));
};

module.exports = {
  uploadSingleFile,
  uploadMultipleFiles,
  deleteFile,
  deleteMultipleFiles,
  formatImagesForDB,
};
