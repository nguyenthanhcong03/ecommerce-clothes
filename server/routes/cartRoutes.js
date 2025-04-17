const router = require("express").Router();
const cartController = require("../controllers/cartController");
const { checkRole, verifyToken } = require("../middlewares/auth");

router.get("/", verifyToken, cartController.getCart);
router.post("/", verifyToken, cartController.addToCart);
router.patch("/update", verifyToken, cartController.updateCartItem);
router.delete("/:itemId", verifyToken, cartController.removeCartItem);
router.delete("/clear", verifyToken, cartController.clearCart);
router.post("/checkout", verifyToken, cartController.checkout);

// router.post("/many", cartController.postCreateArrayCustomer);

module.exports = router;
