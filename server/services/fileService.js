const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const path = require("path");

const uploadSingleFile = async (file, folder = "uploads") => {
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

const uploadMultipleFiles = async (files, folder = "uploads") => {
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

    const uploadPromises = filesToUpload.map((file) => uploadSingleFile(file, folder));
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
        // Tách URL để lấy phần path sau upload/
        const regex = /\/upload\/(.+)\.\w+$/;
        const match = file.match(regex);

        if (match && match[1]) {
          publicId = match[1];
        } else {
          // Phương pháp dự phòng nếu regex không khớp
          const urlParts = file.split("/");
          // Lấy vị trí của "upload" trong URL
          const uploadIndex = urlParts.findIndex((part) => part === "upload");

          if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
            // Lấy phần sau "upload" đến trước phần mở rộng
            const filenameParts = urlParts[urlParts.length - 1].split(".");
            const filenameWithoutExt = filenameParts[0];

            const folderPath = urlParts.slice(uploadIndex + 1, urlParts.length - 1).join("/");
            publicId = folderPath ? `${folderPath}/${filenameWithoutExt}` : filenameWithoutExt;
          } else {
            throw new Error("URL không hợp lệ, không thể trích xuất public_id");
          }
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
