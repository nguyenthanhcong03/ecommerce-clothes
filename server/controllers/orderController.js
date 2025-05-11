const Order = require("../models/order");
const User = require("../models/user");
const Cart = require("../models/cart");
const Coupon = require("../models/coupon");
const orderService = require("../services/orderService");

// Create a new order
const createOrder = async (req, res) => {
  try {
    const { products, shippingAddress, paymentMethod, couponCode, distance, note } = req.body;

    const userId = req.user._id;

    // Validate required fields
    if (!products || !products.length || !shippingAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Missing required order details",
      });
    }

    // Calculate total price
    let subtotal = products.reduce(
      (sum, item) => sum + (item.snapshot.discountPrice || item.snapshot.price) * item.quantity,
      0
    );

    // Tính phí vận chuyển
    let shippingFee = 0;
    if (distance) {
      shippingFee = orderService.calculateShippingFee(distance);
    }

    // Apply coupon if provided
    let discountAmount = 0;
    let couponApplied = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode,
        isActive: true,
        expiryDate: { $gt: new Date() },
      });

      if (!coupon) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired coupon code",
        });
      }

      // Calculate discount using orderService
      discountAmount = orderService.calculateDiscount(subtotal, coupon);
      couponApplied = coupon;

      // Update coupon usage
      if (coupon.usageLimit) {
        coupon.usageCount = (coupon.usageCount || 0) + 1;
        await coupon.save();
      }
    }

    // Calculate final price
    const totalPrice = Math.max(0, subtotal - discountAmount + shippingFee);

    // Generate tracking number
    const trackingNumber = orderService.generateTrackingNumber();

    // Create the order
    const newOrder = new Order({
      userId: userId || null,
      products,
      totalPrice: totalPrice,
      shippingAddress,
      payment: {
        method: paymentMethod,
        isPaid: paymentMethod !== "COD", // Mark as paid for non-COD methods
        paidAt: paymentMethod !== "COD" ? new Date() : null,
      },
      trackingNumber,
      couponApplied,
      discountAmount,
      shippingFee,
      note: note || "",
    });

    const savedOrder = await newOrder.save();

    // Nếu tạo đơn hàng thành công, xóa các sản phẩm giỏ hàng
    const cart = await Cart.findOne({ userId: userId });

    if (cart) {
      cart.items = cart.items.filter(
        (item) =>
          !products.some(
            (product) =>
              product.productId === item.productId.toString() && product.variantId === item.variantId.toString()
          )
      );
      console.log("cart.items", cart.items);
      await cart.save();
    }

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: savedOrder,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all orders (admin)
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
      populate: "userId",
    };

    const result = await orderService.getOrders(query, options);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user orders
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
    };

    const result = await orderService.getOrders(query, options);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate("userId");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if the user is authorized (admin or the order owner)
    const isAdmin = req.user.role === "admin";
    const isOwner = order.userId._id.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this order",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Processing", "Shipping", "Delivered", "Cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.status = status;

    // Update delivered timestamp if status is Delivered
    if (status === "Delivered") {
      order.deliveredAt = new Date();
    }

    const updatedOrder = await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPaid } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.payment.isPaid = isPaid;
    if (isPaid) {
      order.payment.paidAt = new Date();
    } else {
      order.payment.paidAt = null;
    }

    const updatedOrder = await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get order statistics for admin dashboard
const getOrderStatistics = async (req, res) => {
  try {
    const statistics = await orderService.getOrderStatistics();

    return res.status(200).json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  getOrderStatistics,
};
