const path = require("path");
const cloudinary = require("../config/cloudinary");

const uploadSingleFile = async (fileData, folder) => {
  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          transformation: [{ width: 1000, height: 1000, crop: "limit" }, { quality: "auto" }, { fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(fileData.data);
    });

    return {
      url: result.secure_url,
      format: result.format,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error("Upload error:", error);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

const uploadMultipleFiles = async (files, folder) => {
  try {
    const uploadPromises = files.map((file) => uploadSingleFile(file, folder));
    return Promise.all(uploadPromises);
  } catch (error) {
    console.error("Multiple upload error:", error);
    throw new Error(`Multiple files upload failed: ${error.message}`);
  }
};

/**
 * Delete images from Cloudinary
 * @param {Array} images - Array of image objects with public_id or URLs
 * @returns {Promise<Array>} - Results of deletion operations
 */
const deleteFileCloudinary = async (images) => {
  if (!images || images.length === 0) {
    return [];
  }

  const results = [];

  for (const image of images) {
    try {
      let publicId;

      // Handle different input formats
      if (typeof image === "string") {
        // If image is a URL string, extract public_id
        const segments = image.split("/");
        const publicIdWithExtension = segments.slice(-3).join("/"); // folder/filename.ext
        // publicId = publicIdWithExtension.split(".")[0]; // Remove extension
        publicId = publicIdWithExtension.replace(/\.[^/.]+$/, ""); // bỏ đuôi .jpg
      } else {
        console.warn("Invalid image format:", image);
        continue;
      }

      const result = await cloudinary.uploader.destroy(publicId);
      results.push({ publicId, result });
    } catch (err) {
      console.error(`Không thể xoá ảnh:`, err.message);
      results.push({ error: err.message });
    }
  }

  return results;
};

/**
 * Format uploaded images to match the imageSchema
 * @param {Array} uploadResults - Results from uploadMultipleFiles
 * @returns {Array} - Array of objects formatted for MongoDB
 */
const formatImagesForDB = (uploadResults) => {
  return uploadResults.map((result) => ({
    url: result.url,
  }));
};

module.exports = {
  uploadSingleFile,
  uploadMultipleFiles,
  deleteFileCloudinary,
  formatImagesForDB,
};
