const express = require("express");
const categoryController = require("../controllers/categoryController");

const router = express.Router();

// Public route for getting category tree
router.get("/tree", categoryController.getTreeCategories);

router.get("/", categoryController.getAllCategories);
router.post("/", categoryController.createCategory);
router.put("/:id", categoryController.updateCategoryById);
router.delete("/:id", categoryController.deleteCategory);
router.get("/:id", categoryController.getCategoryById);

module.exports = router;
