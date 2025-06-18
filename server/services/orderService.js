const Order = require("../models/order");

// Tính phí vận chuyển dựa trên khoảng cách
function calculateShippingFee(distanceKm) {
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

// Tính toán giảm giá dựa trên mã mã giảm giá
function calculateDiscount(totalPrice, coupon) {
  if (!coupon) {
    return 0;
  }

  let discountAmount = 0;

  if (coupon.discountType === "percentage") {
    discountAmount = (totalPrice * coupon.discountValue) / 100;
  } else {
    discountAmount = coupon.discountValue;
  }

  // Áp dụng giảm giá tối đa nếu có
  if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
    discountAmount = coupon.maxDiscountAmount;
  }

  return discountAmount;
}

// Tạo mã vận đơn
function generateTrackingNumber() {
  return "TRK" + Date.now() + Math.floor(Math.random() * 1000);
}

// Lấy danh sách đơn hàng với phân trang và lọc
async function getOrders(query = {}, options = {}) {
  const { page = 1, limit = 10, sort = { createdAt: -1 }, populate } = options;

  const skip = (page - 1) * limit;

  const orders = await Order.find(query).skip(skip).limit(limit).sort(sort).populate(populate);

  const total = await Order.countDocuments(query);

  return {
    orders,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Tìm kiếm đơn hàng theo từ khóa
async function searchOrders(query, keyword, options = {}) {
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

module.exports = {
  calculateShippingFee,
  calculateDiscount,
  generateTrackingNumber,
  getOrders,
  searchOrders,
};
