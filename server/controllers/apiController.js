const User = require("../models/user");
const { createUserService } = require("../services/userService");
const { uploadSingleFile, uploadMultipleFiles } = require("../services/fileService");

const postUploadSingleFile = async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }
  let result = await uploadSingleFile(req.files.image);
  return res.status(200).json({
    EC: 0,
    data: result,
  });
};

const postUploadMultipleFiles = async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }
  if (Array.isArray(req.files.image)) {
    //upload multiple file
    let result = await uploadMultipleFiles(req.files.image);
    return res.status(200).json({
      EC: 0,
      data: result,
    });
  } else {
    //upload single file
    return await postUploadSingleFile(req, res);
  }
};

module.exports = { postUploadSingleFile, postUploadMultipleFiles };
