const path = require("path");
const cloudinary = require("../config/cloudinary");

const uploadSingleFile = async (fileData) => {
  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "ecommerce/avatar",
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
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

const uploadMultipleFiles = async (files) => {
  const uploadPromises = files.map((file) => uploadSingleFile(file));
  return Promise.all(uploadPromises);
};

module.exports = { uploadSingleFile, uploadMultipleFiles };
