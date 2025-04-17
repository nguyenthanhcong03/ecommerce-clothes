const router = require("express").Router();
const productController = require("../controllers/productController");
const { verifyToken, checkRole, admin } = require("../middlewares/auth");
const upload = require("../config/cloudinary");

router.get("/", productController.getAllProducts);
router.post("/", verifyToken, checkRole("admin"), productController.createProduct);
router.put("/:pid", verifyToken, admin, productController.updateProduct);
router.delete("/:pid", verifyToken, checkRole("admin"), productController.deleteProduct);
router.get("/:pid", productController.getProductById);
// router.put("/upload-image/:pid", upload.single("image"), productController.uploadImageProduct);

module.exports = router;
