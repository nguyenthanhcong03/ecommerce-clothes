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

// Cancel order (user can only cancel their own orders in Pending or Processing state)
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Cancellation reason is required",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if the user is authorized (must be the order owner)
    if (order.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this order",
      });
    }

    // Check if the order can be cancelled (only Pending or Processing orders can be cancelled)
    if (!["Pending", "Processing"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Only pending or processing orders can be cancelled",
      });
    }

    // Update order status to Cancelled
    order.status = "Cancelled";
    order.cancelReason = reason;
    order.cancelTime = new Date();

    const updatedOrder = await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: updatedOrder,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Search orders by keyword (order ID, product name, phone number, etc.)
const searchOrders = async (req, res) => {
  try {
    const { keyword } = req.query;
    const userId = req.user._id;
    const isAdmin = req.user.role === "admin";

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: "Search keyword is required",
      });
    }

    // Build search query
    let query = {};

    // For admin, search all orders, for regular users, only their own orders
    if (!isAdmin) {
      query.userId = userId;
    }

    // Search by order ID if the keyword matches MongoDB ObjectId pattern
    if (/^[0-9a-fA-F]{24}$/.test(keyword)) {
      query._id = keyword;
    } else {
      // Search by tracking number or in the shipping address fields
      query = {
        ...query,
        $or: [
          { trackingNumber: { $regex: keyword, $options: "i" } },
          { "shippingAddress.fullName": { $regex: keyword, $options: "i" } },
          { "shippingAddress.phoneNumber": { $regex: keyword, $options: "i" } },
          { "products.snapshot.name": { $regex: keyword, $options: "i" } },
        ],
      };
    }

    const options = {
      page: parseInt(req.query.page || 1, 10),
      limit: parseInt(req.query.limit || 10, 10),
      sort: { createdAt: -1 },
    };

    // Sử dụng service để tìm kiếm đơn hàng
    const result = await orderService.searchOrders(query, keyword, options);

    return res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Review an order after delivery
const reviewOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderRating, comment, productReviews } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!orderRating || orderRating < 1 || orderRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Valid order rating (1-5) is required",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if the user is authorized (must be the order owner)
    if (order.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to review this order",
      });
    }

    // Check if the order has been delivered
    if (order.status !== "Delivered") {
      return res.status(400).json({
        success: false,
        message: "Only delivered orders can be reviewed",
      });
    }

    // Check if order has already been reviewed
    if (order.isReviewed) {
      return res.status(400).json({
        success: false,
        message: "This order has already been reviewed",
      });
    }

    // Process the review
    order.review = {
      rating: orderRating,
      comment: comment || "",
      reviewDate: new Date(),
    };
    order.isReviewed = true;

    // Save product reviews if provided
    if (productReviews && Array.isArray(productReviews)) {
      // First we should save each product review in a product review collection
      // This part would typically involve creating product reviews in another collection
      // But for simplicity, we'll just add them to the order for now
      order.productReviews = productReviews.map((review) => ({
        productId: review.productId,
        rating: review.rating,
        comment: review.comment || "",
        reviewDate: new Date(),
      }));

      // In a real application, you would also update the product's average rating
      // and associate the review with the product in a separate collection
    }

    const updatedOrder = await order.save();

    return res.status(200).json({
      success: true,
      message: "Order reviewed successfully",
      data: updatedOrder,
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
  cancelOrder,
  searchOrders,
  reviewOrder,
};
