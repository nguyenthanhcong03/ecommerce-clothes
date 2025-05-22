const Product = require("../models/product");
const Cart = require("../models/cart");
const { syncCartItemSnapshots } = require("../utils/cart.utils");

// Lấy giỏ hàng của người dùng
const getCart = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Không có quyền truy cập" });

    let cart = await Cart.findOne({ userId });
    if (!cart)
      return res.json({
        success: false,
        message: "Lấy giỏ hàng thất bại",
        data: {
          items: [],
          totalCartItems: 0,
          totalPrice: 0,
        },
      });

    // Cập nhật snapshot sản phẩm/variant trong giỏ hàng
    await syncCartItemSnapshots(cart);

    const totalCartItems = cart?.items?.length || 0;

    // Tính tổng
    const summary = cart.items.reduce(
      (acc, item) => {
        if (item.isAvailable) {
          const price = item.snapshot.discountPrice ?? item.snapshot.price;
          acc.totalPrice += price * item.quantity;
        }
        return acc;
      },
      { totalPrice: 0 }
    );

    return res.status(200).json({
      success: true,
      message: "Lấy giỏ hàng thành công",
      data: {
        items: cart.items,
        totalCartItems,
        totalPrice: summary.totalPrice,
      },
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, variantId, quantity } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. User not logged in." });
    }

    if (!productId || !variantId || !quantity) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // 1. Kiểm tra sản phẩm và biến thể có tồn tại
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const variant = product.variants.id(variantId);
    if (!variant) return res.status(404).json({ message: "Variant not found" });

    if (variant.stock < quantity) return res.status(400).json({ message: "Not enough stock" });

    // 2. Tìm hoặc tạo giỏ hàng cho user
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Kiểm tra item đã tồn tại chưa
    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId && item.variantId.toString() === variantId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId,
        variantId,
        quantity,
        snapshot: {
          name: product.name,
          price: variant.price,
          discountPrice: variant.discountPrice,
          color: variant.color,
          size: variant.size,
          image: variant.images[0],
        },
        isAvailable: variant.stock > 0,
      });
    }

    await cart.save();
    const totalCartItems = cart?.items.length || 0;

    return res.status(200).json({
      success: true,
      message: "Thêm vào giỏ hàng thành công.",
      data: {
        items: cart.items,
        totalCartItems,
      },
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Cập nhật số lượng sản phẩm
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, variantId, quantity } = req.body;

    if (!userId || !productId || !variantId || typeof quantity !== "number") {
      return res.status(400).json({ message: "Invalid request" });
    }

    // 1. Kiểm tra sản phẩm có tồn tại
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const variant = product.variants.id(variantId);
    if (!variant) return res.status(404).json({ message: "Variant not found" });

    // 2. Tìm giỏ hàng
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // 3. Tìm sản phẩm trong giỏ
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId && item.variantId.toString() === variantId
    );

    // const item = cart.cartItems.find(
    //   (item) => item.productId.toString() === productId && item.variantId.toString() === variantId
    // );
    if (itemIndex === -1) return res.status(404).json({ message: "Item not found in cart" });
    // if (!item) return res.status(404).json({ message: "Item not found in cart" });
    // 4. Nếu quantity = 0 → xóa item khỏi giỏ
    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      // Kiểm tra tồn kho
      if (variant.stock < quantity) return res.status(400).json({ message: "Not enough stock" });

      // Cập nhật số lượng và trạng thái snapshot
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].snapshot.price = variant.price;
      cart.items[itemIndex].snapshot.discountPrice = variant.discountPrice;
      cart.items[itemIndex].isAvailable = variant.stock > 0;
    }
    // item.quantity = quantity;

    const totalCartItems = cart?.items?.length || 0;
    // Tính tổng
    const summary = cart.items.reduce(
      (acc, item) => {
        if (item.isAvailable) {
          const price = item.snapshot.discountPrice ?? item.snapshot.price;
          acc.totalPrice += price * item.quantity;
        }
        return acc;
      },
      { totalPrice: 0 }
    );

    await cart.save();
    return res.status(200).json({
      message: "Cập nhật giỏ hàng thành công",
      success: true,
      data: {
        items: cart.items,
        totalCartItems,
        cartItemUpdated: cart.items[itemIndex],
        totalPrice: summary.totalPrice,
      },
    });
  } catch (error) {
    console.error("Update cart item error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Xoá sản phẩm khỏi giỏ hàng
const removeCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;

    // Validate
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "Item ID is required",
      });
    }
    // 1. Tìm giỏ hàng
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    // 2. Tìm vị trí sản phẩm trong giỏ
    const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    // cart.cartItems = cart.cartItems.filter((item) => item.variantId.toString() !== variantId);
    // 3. Xóa sản phẩm khỏi giỏ
    cart.items.splice(itemIndex, 1);
    await cart.save();

    const totalCartItems = cart?.items?.length || 0;

    // Tính tổng giá trị giỏ hàng
    const summary = cart.items.reduce(
      (acc, item) => {
        if (item.isAvailable) {
          const price = item.snapshot.discountPrice ?? item.snapshot.price;
          acc.totalPrice += price * item.quantity;
        }
        return acc;
      },
      { totalPrice: 0 }
    );
    return res.status(200).json({
      success: true,
      message: "Xóa sản phẩm khỏi giỏ hàng thành công",
      data: {
        items: cart.items,
        totalCartItems,
        totalPrice: summary.totalPrice,
      },
    });
  } catch (error) {
    console.error("Remove cart item error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Xóa nhiều sản phẩm khỏi giỏ hàng cùng lúc
const removeMultipleCartItems = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemIds } = req.body;

    // Validate
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Valid item IDs array is required",
      });
    }

    // 1. Tìm giỏ hàng
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    // 2. Lọc ra các items cần giữ lại (không có trong danh sách xóa)
    const initialItemsCount = cart.items.length;
    cart.items = cart.items.filter((item) => !itemIds.includes(item._id.toString()));

    // Kiểm tra số lượng items đã xóa
    const removedItemsCount = initialItemsCount - cart.items.length;

    if (removedItemsCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No matching items found in cart",
      });
    }

    // 3. Lưu giỏ hàng đã cập nhật
    await cart.save();

    const totalCartItems = cart?.items?.length || 0;

    // 4. Tính tổng giá trị giỏ hàng
    const summary = cart.items.reduce(
      (acc, item) => {
        if (item.isAvailable) {
          const price = item.snapshot.discountPrice ?? item.snapshot.price;
          acc.totalPrice += price * item.quantity;
        }
        return acc;
      },
      { totalPrice: 0 }
    );

    return res.status(200).json({
      success: true,
      message: `Đã xóa ${removedItemsCount} sản phẩm khỏi giỏ hàng`,
      data: {
        items: cart.items,
        totalCartItems,
        totalPrice: summary.totalPrice,
      },
    });
  } catch (error) {
    console.error("Remove multiple cart items error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // 1. Tìm giỏ hàng của người dùng
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // 2. Xóa toàn bộ sản phẩm trong giỏ
    cart.items = [];

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Xóa tất cả sản phẩm trong giỏ hàng thành công",
      data: {
        items: cart.items,
        totalCartItems: 0,
        totalPrice: 0,
      },
    });
  } catch (error) {
    console.error("Clear cart error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  removeMultipleCartItems,
  clearCart,
};
