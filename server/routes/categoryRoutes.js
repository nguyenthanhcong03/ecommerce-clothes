const express = require("express");
const categoryController = require("../controllers/categoryController");

const router = express.Router();

router.get("/tree", categoryController.getTreeCategories);
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);
router.post("/", categoryController.createCategory);
router.put("/:id", categoryController.updateCategoryById);
router.delete("/:id", categoryController.deleteCategory);
router.get("/:id", categoryController.getCategoryById);

module.exports = router;
