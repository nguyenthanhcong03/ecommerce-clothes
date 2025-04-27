const router = require("express").Router();
const fileController = require("../controllers/fileController");
const { memoryUpload, cloudUpload } = require("../config/multer");
const { verifyToken, checkRole } = require("../middlewares/auth");

// ===== CLOUD UPLOAD (mới) =====
/**
 * @route POST /api/file/cloud/upload
 * @desc Tải một file trực tiếp lên Cloudinary
 * @access Public (Công khai)
 */
router.post("/cloud/upload", cloudUpload.single("file"), fileController.uploadFile);

/**
 * @route POST /api/file/cloud/upload/multiple
 * @desc Tải nhiều files trực tiếp lên Cloudinary
 * @access Public (Công khai)
 */
router.post("/cloud/upload/multiple", cloudUpload.array("files", 10), fileController.uploadMultipleFilesHandler);

/**
 * Routes được bảo vệ - chỉ người dùng đã xác thực mới có thể tải lên files
 */
router.post("/cloud/secure/upload", verifyToken, cloudUpload.single("file"), fileController.uploadFile);
router.post(
  "/cloud/secure/upload/multiple",
  verifyToken,
  cloudUpload.array("files", 10),
  fileController.uploadMultipleFilesHandler
);

/**
 * Routes chỉ dành cho admin
 */
router.post(
  "/cloud/admin/upload",
  verifyToken,
  checkRole("admin"),
  cloudUpload.single("file"),
  fileController.uploadFile
);
router.post(
  "/cloud/admin/upload/multiple",
  verifyToken,
  checkRole("admin"),
  cloudUpload.array("files", 10),
  fileController.uploadMultipleFilesHandler
);

module.exports = router;
