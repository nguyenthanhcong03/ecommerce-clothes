const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const path = require("path");

const uploadSingleFileService = async (file, folder = "uploads") => {
  try {
    // Xử lý file từ express-fileupload
    if (file.data) {
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

        uploadStream.end(file.data);
      });
    }

    // Nếu file có đường dẫn tạm thời (trong trường hợp tempFilePath được sử dụng)
    if (file.tempFilePath) {
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder,
        resource_type: "auto",
        transformation: [{ width: 1000, height: 1000, crop: "limit" }, { quality: "auto" }, { fetch_format: "auto" }],
      });

      // Xóa file tạm nếu cần
      fs.unlinkSync(file.tempFilePath);

      return result;
    }

    throw new Error("Định dạng file không hợp lệ");
  } catch (error) {
    console.error("Lỗi upload file:", error);
    throw error;
  }
};

const uploadMultipleFilesService = async (files, folder = "uploads") => {
  try {
    // Xử lý trường hợp files là một đối tượng với nhiều file
    // express-fileupload trả về dạng { fieldName1: file1, fieldName2: file2 } hoặc { fieldName: [file1, file2] }
    let filesToUpload = [];

    if (!Array.isArray(files)) {
      // Nếu files là một đối tượng từ req.files (express-fileupload)
      if (files.files) {
        // Trường hợp req.files.files
        filesToUpload = Array.isArray(files.files) ? files.files : [files.files];
      } else {
        // Trường hợp req.files là một đối tượng với nhiều file
        filesToUpload = Object.values(files).flat();
      }
    } else {
      filesToUpload = files;
    }

    const uploadPromises = filesToUpload.map((file) => uploadSingleFileService(file, folder));
    return Promise.all(uploadPromises);
  } catch (error) {
    console.error("Lỗi upload nhiều files:", error);
    throw error;
  }
};

/**
 * Trích xuất public_id từ URL Cloudinary
 * @param {String} url - URL Cloudinary
 * @returns {String} - public_id
 */
const extractPublicIdFromUrl = (url) => {
  try {
    // Regex để trích xuất public_id từ URL Cloudinary
    // URL format: https://res.cloudinary.com/[cloud_name]/[resource_type]/upload/[version]/[public_id].[format]
    // hoặc: https://res.cloudinary.com/[cloud_name]/[resource_type]/upload/[public_id].[format]

    // Loại bỏ tham số query nếu có
    const cleanUrl = url.split("?")[0];

    // Tìm vị trí của "upload/" trong URL
    const uploadPattern = /\/upload\/(?:v\d+\/)?([^\.]+)/;
    const match = cleanUrl.match(uploadPattern);

    if (match && match[1]) {
      return match[1];
    }

    // Phương pháp dự phòng - tách URL thủ công
    const urlParts = cleanUrl.split("/");
    const uploadIndex = urlParts.findIndex((part) => part === "upload");

    if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
      // Bỏ qua version nếu có (vXXXX)
      let startIndex = uploadIndex + 1;
      if (urlParts[startIndex] && urlParts[startIndex].match(/^v\d+$/)) {
        startIndex++;
      }

      // Lấy phần từ sau upload (và version nếu có) đến cuối, loại bỏ extension
      const pathParts = urlParts.slice(startIndex);
      const lastPart = pathParts[pathParts.length - 1];
      const lastPartWithoutExt = lastPart.split(".")[0];

      pathParts[pathParts.length - 1] = lastPartWithoutExt;
      return pathParts.join("/");
    }

    throw new Error("Không thể trích xuất public_id từ URL");
  } catch (error) {
    throw new Error(`URL không hợp lệ: ${error.message}`);
  }
};

/**
 * Xóa một file từ Cloudinary theo URL
 * @param {String} url - URL của file trên Cloudinary
 * @returns {Promise} - Trả về kết quả xóa từ Cloudinary
 */
const deleteFileService = async (url) => {
  try {
    if (!url || typeof url !== "string") {
      throw new Error("URL không hợp lệ");
    }

    // Kiểm tra xem có phải là URL Cloudinary không
    if (!url.includes("cloudinary.com")) {
      throw new Error("URL không phải từ Cloudinary");
    }

    // Trích xuất public_id từ URL
    const publicId = extractPublicIdFromUrl(url);

    console.log(`Đang xóa file với public_id: ${publicId}`);

    // Xóa file từ Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    // Kiểm tra kết quả xóa
    if (result.result === "ok") {
      console.log(`Đã xóa thành công file: ${publicId}`);
    } else if (result.result === "not found") {
      console.log(`File không tồn tại: ${publicId}`);
    }

    return result;
  } catch (error) {
    console.error("Lỗi xóa file:", error);
    throw error;
  }
};

/**
 * Xóa nhiều files từ Cloudinary
 * @param {Array} urls - Mảng các URLs của files cần xóa
 * @returns {Promise} - Trả về mảng kết quả xóa từ Cloudinary
 */
const deleteMultipleFilesService = async (urls) => {
  try {
    if (!Array.isArray(urls) || urls.length === 0) {
      throw new Error("Danh sách URLs không hợp lệ");
    }

    console.log(`Đang xóa ${urls.length} files...`);

    const deletePromises = urls.map((url, index) =>
      deleteFileService(url).catch((error) => {
        console.error(`Lỗi xóa file ${index + 1}:`, error);
        return { error: error.message, url };
      })
    );

    const results = await Promise.all(deletePromises);

    // Thống kê kết quả
    const successful = results.filter((result) => !result.error);
    const failed = results.filter((result) => result.error);

    console.log(`Hoàn thành xóa files: ${successful.length} thành công, ${failed.length} thất bại`);

    return results;
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
  uploadSingleFileService,
  uploadMultipleFilesService,
  deleteFileService,
  deleteMultipleFilesService,
  formatImagesForDB,
  extractPublicIdFromUrl,
};
