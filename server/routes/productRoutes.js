const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { verifyToken, checkRole } = require("../middlewares/auth");

// Routes cho public
router.get("/", productController.getAllProducts);
router.get("/search", productController.searchProducts);
router.get("/featured", productController.getFeaturedProducts);
router.get("/category/:categoryId", productController.getProductsByCategory);
router.get("/:pid", productController.getProductById);
router.get("/:pid/related", productController.getRelatedProducts);
router.get("/:pid/variant/:variantId", productController.getProductVariantById);

// Routes cho Admin
router.post("/", verifyToken, checkRole("admin"), productController.createProduct);
router.put("/:pid", verifyToken, checkRole("admin"), productController.updateProduct);
router.delete("/:pid", verifyToken, checkRole("admin"), productController.deleteProduct);

module.exports = router;
