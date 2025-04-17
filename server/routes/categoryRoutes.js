const router = require("express").Router();
const categoryController = require("../controllers/categoryController");
const { checkRole, verifyToken } = require("../middlewares/auth");

router.get("/", categoryController.getAllCategories);
router.post("/", categoryController.createCategory);
router.put("/:id", categoryController.updateCategoryById);

// router.post("/many", categoryController.postCreateArrayCustomer);

module.exports = router;
