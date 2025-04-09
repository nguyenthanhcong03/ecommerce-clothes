const path = require("path");
const cloudinary = require("../config/cloudinary");

const uploadSingleFile = async (fileObject) => {
  let uploadPath = path.resolve(__dirname, "../public/images/upload");
  let extName = path.extname(fileObject.name);
  let baseName = path.basename(fileObject.name, extName);

  let fileName = `${baseName}-${Date.now()}${extName}`;
  let filePath = `${uploadPath}/${fileName}`;
  try {
    await fileObject.mv(filePath);
    return {
      status: "success",
      path: fileName,
      error: null,
    };
  } catch (error) {
    console.log("check error", error);
    return {
      status: "failed",
      path: null,
      error: JSON.stringify(err),
    };
  }
};

const uploadMultipleFiles = async (fileArr) => {
  try {
    let uploadPath = path.resolve(__dirname, "../public/images/upload");
    let resultArr = [];
    let countSuccess = 0;
    for (let i = 0; i < fileArr.length; i++) {
      let extName = path.extname(fileArr[i].name);
      let baseName = path.basename(fileArr[i].name, extName);
      let fileName = `${baseName}-${Date.now()}${extName}`;
      let filePath = `${uploadPath}/${fileName}`;
      try {
        await fileArr[i].mv(filePath);
        resultArr.push({
          status: "success",
          path: fileName,
          error: null,
          fileName: fileArr[i].name,
        });
        countSuccess++;
      } catch (error) {
        resultArr.push({
          status: "failed",
          path: null,
          error: JSON.stringify(error),
          fileName: fileArr[i].name,
        });
      }
    }
    return {
      countSuccess,
      detail: resultArr,
    };
  } catch (error) {
    console.log(error);
  }
};

module.exports = { uploadSingleFile, uploadMultipleFiles };
