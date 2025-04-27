const router = require("express").Router();
const productController = require("../controllers/productController");
const { verifyToken, checkRole } = require("../middlewares/auth");

/**
 * Public routes - no authentication required
 */
// Get all products with filtering, sorting, and pagination
router.get("/", productController.getAllProducts);

// Get a single product by ID
router.get("/:pid", productController.getProductById);

// Get products by category
router.get("/category/:categoryId", productController.getProductsByCategory);

// Search products
router.get("/search/query", productController.searchProducts);

// Get featured products
router.get("/featured/list", productController.getFeaturedProducts);

/**
 * Protected routes - admin only
 */
// Create a new product
router.post("/", verifyToken, checkRole("admin"), productController.createProduct);

// Update an existing product
router.put("/:pid", verifyToken, checkRole("admin"), productController.updateProduct);

// Delete a product
router.delete("/:pid", verifyToken, checkRole("admin"), productController.deleteProduct);

// Update product status (active/inactive)
router.patch("/:pid/status", verifyToken, checkRole("admin"), productController.updateProductStatus);

/**
 * Customer interaction routes
 */
// Add or update product rating/review
router.post("/:pid/reviews", verifyToken, productController.addProductReview);

// Get product reviews
router.get("/:pid/reviews", productController.getProductReviews);

module.exports = router;
