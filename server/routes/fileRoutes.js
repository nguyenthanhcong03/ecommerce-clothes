const router = require("express").Router();
const fileController = require("../controllers/fileController");
const { verifyToken, checkRole } = require("../middlewares/auth");

router.post("/cloud/upload", fileController.uploadFile);

router.post("/cloud/upload/multiple", fileController.uploadMultipleFiles);

router.delete("/cloud/delete", fileController.deleteFile);

router.delete("/cloud/delete/multiple", fileController.deleteMultipleFiles);

module.exports = router;
