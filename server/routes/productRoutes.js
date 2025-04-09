const router = require("express").Router();
const productController = require("../controllers/productController");
const { protect, admin } = require("../middlewares/auth");
const upload = require("../config/cloudinary");

router.post("/", protect, admin, productController.createProduct2);
router.get("/", productController.getAllProducts2);
router.put("/:pid", protect, admin, productController.updateProduct);
router.delete("/:pid", protect, admin, productController.deleteProduct);
router.get("/:pid", productController.getProduct);
// router.put("/upload-image/:pid", upload.single("image"), productController.uploadImageProduct);

module.exports = router;
