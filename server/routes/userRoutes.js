const router = require("express").Router();
const userController = require("../controllers/userController");
const { verifyToken, checkRole } = require("../middlewares/auth");

router.post("/", userController.createUser);
router.get("/", verifyToken, checkRole("admin"), userController.getAllUsers);
router.delete("/", verifyToken, checkRole("admin"), userController.deleteUser);
router.put("/current", verifyToken, userController.updateUser);
router.post("/upload-image", userController.uploadAvatar);
router.post("/upload-multiple-images", userController.uploadMultipleImages);

router.put("/:uid", verifyToken, checkRole("admin"), userController.updateUserByAdmin);

module.exports = router;
