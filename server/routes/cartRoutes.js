const router = require("express").Router();
const cartController = require("../controllers/cartController");
const { checkRole, verifyToken } = require("../middlewares/auth");

router.get("/", verifyToken, cartController.getCart);
router.post("/", verifyToken, cartController.addToCart);
router.patch("/update", verifyToken, cartController.updateCartItem);
router.delete("/multiple", verifyToken, cartController.removeMultipleCartItems);
router.delete("/clear", verifyToken, cartController.clearCart);
router.delete("/:itemId", verifyToken, cartController.removeCartItem);

module.exports = router;
