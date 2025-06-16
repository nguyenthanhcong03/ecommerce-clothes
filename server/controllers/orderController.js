const Order = require("../models/order");
const User = require("../models/user");
const Cart = require("../models/cart");
const Coupon = require("../models/coupon");
const Product = require("../models/product");
const orderService = require("../services/orderService");
const { createVnpayPaymentUrl, createMomoPaymentUrl } = require("../services/paymentService");

const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      paymentStatus,
      paymentMethod,
      startDate,
      endDate,
      search,
      minAmount,
      maxAmount,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    // Xây dựng query động dựa trên các tham số lọc
    const query = {};

    // Lọc theo trạng thái đơn hàng
    if (status) {
      // Hỗ trợ nhiều trạng thái (dạng mảng)
      if (Array.isArray(status)) {
        query.status = { $in: status };
      } else {
        query.status = status;
      }
    }

    // Lọc theo trạng thái thanh toán
    if (paymentStatus) {
      if (Array.isArray(paymentStatus)) {
        query["payment.isPaid"] = { $in: paymentStatus };
      } else {
        query["payment.isPaid"] = paymentStatus;
      }
    }

    // Lọc theo phương thức thanh toán
    if (paymentMethod) {
      if (Array.isArray(paymentMethod)) {
        query["payment.method"] = { $in: paymentMethod };
      } else {
        query["payment.method"] = paymentMethod;
      }
    }

    // Lọc theo khoảng thời gian
    if (startDate || endDate) {
      query.createdAt = {};

      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }

      if (endDate) {
        // Thêm 1 ngày để bao gồm cả ngày kết thúc
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endOfDay;
      }
    }

    // Lọc theo khoảng giá trị đơn hàng
    if (minAmount || maxAmount) {
      query.totalPrice = {};

      if (minAmount) {
        query.totalPrice.$gte = parseFloat(minAmount);
      }

      if (maxAmount) {
        query.totalPrice.$lte = parseFloat(maxAmount);
      }
    }

    // Tìm kiếm theo từ khóa (ID, tên khách hàng, số điện thoại, email)
    if (search) {
      // Kiểm tra xem search có phải là MongoDB ObjectId không
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(search);

      const searchQuery = [
        { "shippingAddress.fullName": { $regex: search, $options: "i" } },
        { "shippingAddress.phoneNumber": { $regex: search, $options: "i" } },
        { "shippingAddress.email": { $regex: search, $options: "i" } },
        { trackingNumber: { $regex: search, $options: "i" } },
      ];

      // Nếu search là ObjectId hợp lệ, thêm tìm kiếm theo _id
      if (isValidObjectId) {
        searchQuery.push({ _id: search });
      }

      query.$or = searchQuery;
    }

    // Tính toán phân trang
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Tạo sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Lấy đơn hàng với populate để lấy thông tin user
    const orders = await Order.find(query)
      .populate("userId", "username email firstName lastName")
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Đếm tổng số đơn hàng
    const totalOrders = await Order.countDocuments(query);

    // Tính toán metadata phân trang
    const totalPages = Math.ceil(totalOrders / parseInt(limit));

    return res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: {
        orders,
        pagination: {
          total: totalOrders,
          page: Number(pageNumber),
          limit: Number(limitNumber),
          totalPages: totalPages,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách đơn hàng",
      error: error.message,
    });
  }
};

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

    // Kiểm tra giá sản phẩm hiện tại
    const updatedProducts = [];
    const changedProducts = [];

    for (const product of products) {
      const currentProduct = await Product.findById(product.productId);

      if (!currentProduct) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm với ID ${product.productId} không tồn tại hoặc đã bị xóa`,
        });
      }

      let currentVariant = null;
      if (product.variantId && currentProduct.variants && currentProduct.variants.length > 0) {
        currentVariant = currentProduct.variants.find((v) => v._id.toString() === product.variantId);
        if (!currentVariant) {
          return res.status(400).json({
            success: false,
            message: `Biến thể với ID ${product.variantId} không tồn tại cho sản phẩm ${currentProduct.name}`,
          });
        }
      }

      const currentPrice = currentVariant ? currentVariant.price : currentProduct.price;
      const snapshotPrice = product.snapshot.price || product.snapshot.originalPrice;

      if (currentPrice !== snapshotPrice) {
        changedProducts.push({
          productId: product.productId,
          variantId: product.variantId,
          oldPrice: snapshotPrice,
          newPrice: currentPrice,
          productName: currentProduct.name,
          variantName: currentVariant ? currentVariant.name : null,
        });

        const updatedSnapshot = {
          ...product.snapshot,
          price: currentPrice,
          originalPrice: currentPrice,
        };

        updatedProducts.push({
          ...product,
          snapshot: updatedSnapshot,
        });
      } else {
        updatedProducts.push(product);
      }
    }

    // Nếu có sản phẩm thay đổi giá, trả về thông báo
    if (changedProducts.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Giá một số sản phẩm đã thay đổi. Vui lòng xác nhận giá mới.",
        changedProducts,
        updatedProducts,
      });
    }

    // Tính toán giá trị đơn hàng
    const subtotal = products.reduce(
      (sum, item) => sum + (item.snapshot.price || item.snapshot.originalPrice) * item.quantity,
      0
    );

    let shippingFee = 0;
    if (distance) {
      shippingFee = orderService.calculateShippingFee(distance);
    }

    let discountAmount = 0;
    let couponApplied = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode,
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      });

      console.log("vào đây", coupon);
      if (!coupon) {
        return res.status(400).json({
          success: false,
          message: "Mã giảm giá không hợp lệ hoặc đã hết hạn",
        });
      }

      if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({
          success: false,
          message: "Mã giảm giá đã hết lượt sử dụng",
        });
      }

      discountAmount = orderService.calculateDiscount(subtotal, coupon);
      couponApplied = coupon;
    }

    const totalPrice = Math.max(0, subtotal - discountAmount + shippingFee);

    // Nếu là COD, tạo đơn hàng ngay lập tức
    if (paymentMethod === "COD") {
      const trackingNumber = orderService.generateTrackingNumber();

      const newOrder = new Order({
        userId: userId || null,
        products,
        totalPrice: totalPrice,
        shippingAddress,
        payment: {
          method: paymentMethod,
          isPaid: false,
          paidAt: null,
        },
        trackingNumber,
        couponApplied,
        discountAmount,
        shippingFee,
        note: note || "",
      });

      const savedOrder = await newOrder.save();

      // Cập nhật số lượng sản phẩm trong kho
      for (const item of products) {
        const product = await Product.findById(item.productId);
        if (product) {
          if (item.variantId) {
            const variantIndex = product.variants.findIndex((v) => v._id.toString() === item.variantId);
            if (variantIndex !== -1) {
              product.variants[variantIndex].stock = Math.max(0, product.variants[variantIndex].stock - item.quantity);
            }
          } else {
            product.stock = Math.max(0, product.stock - item.quantity);
          }
          await product.save();
        }
      }

      // Xóa sản phẩm khỏi giỏ hàng
      const cart = await Cart.findOne({ userId: userId });
      if (cart) {
        cart.items = cart.items.filter(
          (item) =>
            !products.some(
              (product) =>
                product.productId === item.productId.toString() && product.variantId === item.variantId.toString()
            )
        );
        await cart.save();
      }

      // Cập nhật coupon usage
      if (couponApplied && couponApplied.usageLimit) {
        couponApplied.usageCount = (couponApplied.usageCount || 0) + 1;
        await couponApplied.save();
      }

      return res.status(201).json({
        success: true,
        message: "Tạo đơn hàng thành công",
        data: savedOrder,
      });
    }
    // Nếu là thanh toán online (VNPay hoặc Momo), tạo link thanh toán
    else if (paymentMethod === "VNPay" || paymentMethod === "Momo") {
      // Tạo đơn hàng tạm thời với trạng thái Unpaid
      const trackingNumber = orderService.generateTrackingNumber();

      const tempOrder = new Order({
        userId: userId || null,
        products,
        totalPrice: totalPrice,
        shippingAddress,
        status: "Unpaid",
        payment: {
          method: paymentMethod,
          isPaid: false,
          paidAt: null,
        },
        trackingNumber,
        couponApplied,
        discountAmount,
        shippingFee,
        note: note || "",
      });

      const savedOrder = await tempOrder.save();

      // Cập nhật số lượng sản phẩm trong kho
      for (const item of products) {
        const product = await Product.findById(item.productId);
        if (product) {
          if (item.variantId) {
            const variantIndex = product.variants.findIndex((v) => v._id.toString() === item.variantId);
            if (variantIndex !== -1) {
              product.variants[variantIndex].stock = Math.max(0, product.variants[variantIndex].stock - item.quantity);
            }
          } else {
            product.stock = Math.max(0, product.stock - item.quantity);
          }
          await product.save();
        }
      }

      // Xóa sản phẩm khỏi giỏ hàng
      const cart = await Cart.findOne({ userId: userId });
      if (cart) {
        cart.items = cart.items.filter(
          (item) =>
            !products.some(
              (product) =>
                product.productId === item.productId.toString() && product.variantId === item.variantId.toString()
            )
        );
        await cart.save();
      }

      // Cập nhật coupon usage
      if (couponApplied && couponApplied.usageLimit) {
        couponApplied.usageCount = (couponApplied.usageCount || 0) + 1;
        await couponApplied.save();
      }

      // Tạo liên kết thanh toán
      let paymentUrl;
      const orderId = savedOrder._id.toString();
      const paymentData = {
        amount: totalPrice,
        orderId: orderId,
        orderInfo: `Thanh toán đơn hàng ${orderId}`,
      };

      if (paymentMethod === "VNPay") {
        paymentUrl = createVnpayPaymentUrl(paymentData);
      } else if (paymentMethod === "Momo") {
        paymentUrl = await createMomoPaymentUrl(paymentData);
      }

      return res.status(200).json({
        success: true,
        message: "Tạo liên kết thanh toán thành công",
        paymentUrl,
        orderId,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Phương thức thanh toán không được hỗ trợ",
      });
    }
  } catch (error) {
    console.error("Error in createOrder:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status, paymentStatus } = req.query;

    // Xây dựng query
    const query = { userId };

    if (status) {
      query.status = status;
    }

    if (paymentStatus !== undefined) {
      query["payment.isPaid"] = paymentStatus === "true";
    }

    // Tính toán phân trang
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Lấy đơn hàng của user
    const orders = await Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean();

    // Đếm tổng số đơn hàng
    const totalOrders = await Order.countDocuments(query);

    // Tính toán metadata phân trang
    const totalPages = Math.ceil(totalOrders / parseInt(limit));

    const result = {
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalOrders,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
      },
    };

    return res.status(200).json({
      success: true,
      message: "User orders retrieved successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Build query based on user role
    let query = { _id: id };

    // If user is not admin, they can only see their own orders
    if (userRole !== "admin") {
      query.userId = userId;
    }

    const order = await Order.findOne(query).populate("userId", "fullName email").lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or you don't have permission to view this order",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["Pending", "Processing", "Shipping", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Đơn hàng không tồn tại",
      });
    }

    // Update status
    order.status = status;

    // Cập nhật thời gian giao hàng nếu trạng thái là Delivered
    if (status === "Delivered") {
      order.deliveredAt = new Date();
      // Cập nhật số lượng đã bán cho sản phẩm
      for (const item of order.products) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.salesCount = (product.salesCount || 0) + item.quantity;
          await product.save();
        }
      }
    }

    const updatedOrder = await order.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công",
      data: updatedOrder,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

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

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: id, userId: userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order can be cancelled
    if (order.status === "Delivered" || order.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel this order",
      });
    }

    // Update order status and add cancel reason
    order.status = "Cancelled";
    order.cancelReason = reason || "Customer requested cancellation";
    order.cancelTime = new Date();

    const updatedOrder = await order.save();

    // Restore product stock
    for (const item of order.products) {
      const product = await Product.findById(item.productId);

      if (product) {
        if (item.variantId) {
          const variantIndex = product.variants.findIndex((v) => v._id.toString() === item.variantId);
          if (variantIndex !== -1) {
            product.variants[variantIndex].stock += item.quantity;
          }
        } else {
          product.stock += item.quantity;
        }

        await product.save();
      }
    }

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

const searchOrders = async (req, res) => {
  try {
    const { query: searchQuery, page = 1, limit = 10 } = req.query;
    const userId = req.user._id;

    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    // Create search conditions
    const searchConditions = {
      userId: userId,
      $or: [
        { "shippingAddress.fullName": { $regex: searchQuery, $options: "i" } },
        { "shippingAddress.phoneNumber": { $regex: searchQuery, $options: "i" } },
        { trackingNumber: { $regex: searchQuery, $options: "i" } },
      ],
    };

    // Check if searchQuery is a valid ObjectId for searching by order ID
    if (/^[0-9a-fA-F]{24}$/.test(searchQuery)) {
      searchConditions.$or.push({ _id: searchQuery });
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Search orders
    const orders = await Order.find(searchConditions).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean();

    // Count total matching orders
    const totalOrders = await Order.countDocuments(searchConditions);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalOrders / parseInt(limit));

    const result = {
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalOrders,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
      },
      searchQuery,
    };

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

module.exports = {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  searchOrders,
};
