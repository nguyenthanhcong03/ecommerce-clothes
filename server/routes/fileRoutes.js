const router = require("express").Router();
const fileController = require("../controllers/fileController");
const { verifyToken, checkRole } = require("../middlewares/auth");

router.post("/cloud/upload", fileController.uploadFile);

router.post("/cloud/upload/multiple", fileController.uploadMultipleFilesHandler);

router.delete("/cloud/delete", fileController.deleteFileHandler);

router.delete("/cloud/delete/multiple", fileController.deleteMultipleFilesHandler);

module.exports = router;
