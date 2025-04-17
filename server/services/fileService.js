const path = require("path");
const cloudinary = require("../config/cloudinary");

// const uploadSingleFile = async (fileObject) => {
//   let uploadPath = path.resolve(__dirname, "../public/images/upload");
//   let extName = path.extname(fileObject.name);
//   let baseName = path.basename(fileObject.name, extName);

//   let fileName = `${baseName}-${Date.now()}${extName}`;
//   let filePath = `${uploadPath}/${fileName}`;
//   try {
//     await fileObject.mv(filePath);
//     return {
//       status: "success",
//       path: fileName,
//       error: null,
//     };
//   } catch (error) {
//     console.log("check error", error);
//     return {
//       status: "failed",
//       path: null,
//       error: JSON.stringify(err),
//     };
//   }
// };

// const uploadMultipleFiles = async (fileArr) => {
//   try {
//     let uploadPath = path.resolve(__dirname, "../public/images/upload");
//     let resultArr = [];
//     let countSuccess = 0;
//     for (let i = 0; i < fileArr.length; i++) {
//       let extName = path.extname(fileArr[i].name);
//       let baseName = path.basename(fileArr[i].name, extName);
//       let fileName = `${baseName}-${Date.now()}${extName}`;
//       let filePath = `${uploadPath}/${fileName}`;
//       try {
//         await fileArr[i].mv(filePath);
//         resultArr.push({
//           status: "success",
//           path: fileName,
//           error: null,
//           fileName: fileArr[i].name,
//         });
//         countSuccess++;
//       } catch (error) {
//         resultArr.push({
//           status: "failed",
//           path: null,
//           error: JSON.stringify(error),
//           fileName: fileArr[i].name,
//         });
//       }
//     }
//     return {
//       countSuccess,
//       detail: resultArr,
//     };
//   } catch (error) {
//     console.log(error);
//   }
// };

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
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

const uploadMultipleFiles = async (files, folder) => {
  const uploadPromises = files.map((file) => uploadSingleFile(file, folder));
  return Promise.all(uploadPromises);
};

const deleteFileCloudinary = async (deletedImages) => {
  for (const imageUrl of deletedImages) {
    // Lấy public_id từ URL
    const segments = imageUrl.split("/");
    const publicIdWithExtension = segments.slice(-3).join("/"); // vd: folder/image.jpg
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, ""); // bỏ đuôi .jpg

    try {
      const result = await cloudinary.uploader.destroy(publicId);
      console.log("result", result);
      console.log(`Đã xóa ảnh: ${publicId}`);
      return result;
    } catch (err) {
      console.error(`Không thể xoá ảnh ${publicId}:`, err.message);
    }
  }
};

module.exports = { uploadSingleFile, uploadMultipleFiles, deleteFileCloudinary };
