const router = require("express").Router();
const productController = require("../controllers/productController");
const { protect, admin } = require("../middlewares/auth");

router.post("/", protect, admin, productController.createProduct);
router.get("/", productController.getAllProducts);
router.put("/:pid", protect, admin, productController.updateProduct);
router.delete("/:pid", protect, admin, productController.deleteProduct);
router.get("/:pid", productController.getProduct);

module.exports = router;
