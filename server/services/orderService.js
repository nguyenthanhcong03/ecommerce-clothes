const Order = require("../models/order");

class OrderService {
  // Tính phí vận chuyển dựa trên khoảng cách
  calculateShippingFee(distanceKm) {
    if (distanceKm <= 0) return 0;

    const baseFee = 15000; // Phí cơ bản cho 3km đầu tiên
    const baseDistance = 3; // Số km miễn phí hoặc tính cơ bản
    const extraFeePerKm = 5000; // Phí cho mỗi km vượt quá

    if (distanceKm <= baseDistance) {
      return baseFee;
    } else {
      const extraDistance = Math.ceil(distanceKm - baseDistance);
      return baseFee + extraDistance * extraFeePerKm;
    }
  }

  // Apply a coupon to calculate discount
  calculateDiscount(totalPrice, coupon) {
    if (!coupon) {
      return 0;
    }

    let discountAmount = 0;

    if (coupon.discountType === "percentage") {
      discountAmount = (totalPrice * coupon.discountValue) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }

    // Apply maximum discount if applicable
    if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
      discountAmount = coupon.maxDiscountAmount;
    }

    return discountAmount;
  }

  // Generate a unique tracking number
  generateTrackingNumber() {
    return "TRK" + Date.now() + Math.floor(Math.random() * 1000);
  }
  // Get orders with pagination
  async getOrders(query = {}, options = {}) {
    const { page = 1, limit = 10, sort = { createdAt: -1 }, populate } = options;

    const skip = (page - 1) * limit;

    const orders = await Order.find(query).skip(skip).limit(limit).sort(sort).populate(populate);

    const totalOrders = await Order.countDocuments(query);

    return {
      orders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
      totalOrders,
    };
  }

  // Tìm kiếm đơn hàng theo từ khóa
  async searchOrders(query, keyword, options = {}) {
    const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
    const skip = (page - 1) * limit;

    // Kết hợp query và keyword để tạo full query
    const searchQuery = {
      ...query,
      $or: [
        { trackingNumber: { $regex: keyword, $options: "i" } },
        { "shippingAddress.fullName": { $regex: keyword, $options: "i" } },
        { "shippingAddress.phoneNumber": { $regex: keyword, $options: "i" } },
      ],
    };

    // Thực hiện tìm kiếm
    const orders = await Order.find(searchQuery).skip(skip).limit(limit).sort(sort);

    const totalOrders = await Order.countDocuments(searchQuery);

    return {
      orders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
      totalOrders,
    };
  }

  // Tạo đánh giá cho sản phẩm sau khi đơn hàng hoàn thành
  async createReview(orderId, userId, reviewData) {
    // Kiểm tra đơn hàng có tồn tại và thuộc về người dùng
    const order = await Order.findOne({
      _id: orderId,
      userId,
      status: "Delivered",
      isReviewed: false,
    });

    if (!order) {
      throw new Error("Order not found or cannot be reviewed");
    }

    // Cập nhật đơn hàng với thông tin đánh giá
    order.isReviewed = true;
    order.review = {
      rating: reviewData.rating,
      comment: reviewData.comment,
      reviewDate: new Date(),
    };

    // Lưu thông tin đánh giá sản phẩm nếu có
    if (reviewData.productReviews && reviewData.productReviews.length > 0) {
      order.productReviews = reviewData.productReviews.map((review) => ({
        productId: review.productId,
        rating: review.rating,
        comment: review.comment,
        reviewDate: new Date(),
      }));
    }

    await order.save();
    return order;
  }

  // Calculate order statistics for admin dashboard
  async getOrderStatistics() {
    try {
      const totalOrders = await Order.countDocuments();
      const totalRevenue = await Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalPrice" } } }]);

      const ordersByStatus = await Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);

      // Last 5 orders
      const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate("userId", "name email");

      // Today's orders
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrders = await Order.countDocuments({ createdAt: { $gte: today } });

      // Monthly revenue statistics
      const monthlyRevenue = await Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setDate(1)),
              $lte: new Date(),
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]);

      return {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        ordersByStatus,
        recentOrders,
        todayOrders,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
      };
    } catch (error) {
      throw new Error(`Error getting order statistics: ${error.message}`);
    }
  }
}

module.exports = new OrderService();
