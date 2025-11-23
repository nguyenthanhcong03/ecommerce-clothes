import Order from "../models/order.js";
import Product from "../models/product.js";
import User from "../models/user.js";
import Category from "../models/category.js";
import mongoose from "mongoose";

/**
 * HÃ m helper Ä‘á»ƒ láº¥y Ä‘iá»u kiá»‡n tÃ¬m kiáº¿m theo thá»i gian
 */
const getDateCondition = (period, startDate, endDate) => {
  const now = new Date();
  let dateCondition = {};

  switch (period) {
    case "today":
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateCondition = { createdAt: { $gte: startOfDay } };
      break;
    case "week":
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      dateCondition = { createdAt: { $gte: startOfWeek } };
      break;
    case "month":
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateCondition = { createdAt: { $gte: startOfMonth } };
      break;
    case "year":
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      dateCondition = { createdAt: { $gte: startOfYear } };
      break;
    case "custom":
      if (startDate && endDate) {
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);
        parsedEndDate.setHours(23, 59, 59, 999); // Äáº¿n cuá»‘i ngÃ y
        dateCondition = {
          createdAt: {
            $gte: parsedStartDate,
            $lte: parsedEndDate,
          },
        };
      }
      break;
    default:
      // Máº·c Ä‘á»‹nh láº¥y táº¥t cáº£
      dateCondition = {};
  }

  return dateCondition;
};

/**
 * Láº¥y thá»‘ng kÃª tá»•ng quan
 */
const getOverviewStatistics = async () => {
  // Tá»•ng sá»‘ Ä‘Æ¡n hÃ ng
  const totalOrders = await Order.countDocuments();

  // Tá»•ng doanh thu
  const revenueResult = await Order.aggregate([
    { $match: { status: "Delivered" } }, // Chá»‰ tÃ­nh doanh thu tá»« Ä‘Æ¡n hÃ ng Ä‘Ã£ giao
    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
  ]);
  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

  // Tá»•ng sá»‘ khÃ¡ch hÃ ng
  const totalCustomers = await User.countDocuments({ role: "customer" });

  // Tá»•ng sá»‘ sáº£n pháº©m
  const totalProducts = await Product.countDocuments();

  // ÄÆ¡n hÃ ng Ä‘ang xá»­ lÃ½
  const pendingOrders = await Order.countDocuments({ status: { $in: ["Pending", "Processing"] } });

  // ÄÆ¡n hÃ ng Ä‘Ã£ giao
  const deliveredOrders = await Order.countDocuments({ status: "Delivered" });

  // ÄÆ¡n hÃ ng Ä‘Ã£ há»§y
  const cancelledOrders = await Order.countDocuments({ status: "Cancelled" });

  // ÄÆ¡n hÃ ng hÃ´m nay
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ordersToday = await Order.countDocuments({
    createdAt: { $gte: today },
  });

  // Doanh thu hÃ´m nay
  const revenueTodayResult = await Order.aggregate([
    {
      $match: {
        "statusUpdatedAt.delivered": { $gte: today },
        status: "Delivered",
        // "payment.isPaid": true,
      },
    },
    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
  ]);
  const revenueToday = revenueTodayResult.length > 0 ? revenueTodayResult[0].total : 0;

  return {
    totalOrders,
    totalRevenue,
    totalCustomers,
    totalProducts,
    pendingOrders,
    deliveredOrders,
    cancelledOrders,
    ordersToday,
    revenueToday,
  };
};

/**
 * Láº¥y thá»‘ng kÃª doanh thu
 */
const getRevenueStatistics = async (period, startDate, endDate) => {
  let dateCondition = getDateCondition(period, startDate, endDate);
  let groupBy = {};
  let sortBy = {};

  // Äá»‹nh dáº¡ng group by dá»±a trÃªn period
  switch (period) {
    case "today":
      groupBy = {
        $hour: "$createdAt",
      };
      sortBy = { _id: 1 };
      break;
    case "week":
      groupBy = {
        $dayOfWeek: "$createdAt",
      };
      sortBy = { _id: 1 };
      break;
    case "month":
      groupBy = {
        $dayOfMonth: "$createdAt",
      };
      sortBy = { _id: 1 };
      break;
    case "year":
      groupBy = {
        $month: "$createdAt",
      };
      sortBy = { _id: 1 };
      break;
    case "custom":
      // Náº¿u khoáº£ng thá»i gian dÆ°á»›i 30 ngÃ y thÃ¬ group theo ngÃ y
      if (startDate && endDate) {
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);
        const dayDiff = Math.floor((parsedEndDate - parsedStartDate) / (1000 * 60 * 60 * 24));

        if (dayDiff <= 30) {
          groupBy = {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          };
        } else {
          groupBy = {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          };
        }
        sortBy = { _id: 1 };
      }
      break;
    default:
      groupBy = {
        $month: "$createdAt",
      };
      sortBy = { _id: 1 };
  }

  // Thá»‘ng kÃª doanh thu
  const revenueData = await Order.aggregate([
    {
      $match: {
        ...dateCondition,
        status: "Delivered", // Chá»‰ tÃ­nh doanh thu tá»« Ä‘Æ¡n hÃ ng Ä‘Ã£ giao
      },
    },
    {
      $group: {
        _id: groupBy,
        revenue: { $sum: "$totalPrice" },
        count: { $sum: 1 },
      },
    },
    { $sort: sortBy },
  ]);

  // Thá»‘ng kÃª doanh thu theo phÆ°Æ¡ng thá»©c thanh toÃ¡n
  const paymentMethodData = await Order.aggregate([
    {
      $match: {
        ...dateCondition,
        "payment.status": "Paid",
      },
    },
    {
      $group: {
        _id: "$payment.method",
        revenue: { $sum: "$totalPrice" },
        count: { $sum: 1 },
      },
    },
  ]);

  return {
    revenueByTime: revenueData,
    revenueByPaymentMethod: paymentMethodData,
  };
};

/**
 * Láº¥y thá»‘ng kÃª sáº£n pháº©m bÃ¡n cháº¡y
 */
const getTopProducts = async (limit = 10, period, startDate, endDate) => {
  let dateCondition = getDateCondition(period, startDate, endDate);

  const topProducts = await Order.aggregate([
    {
      $match: {
        ...dateCondition,
        status: { $nin: ["Cancelled"] }, // Loáº¡i bá» Ä‘Æ¡n Ä‘Ã£ há»§y
      },
    },
    { $unwind: "$products" },
    {
      $group: {
        _id: "$products.productId",
        totalSold: { $sum: "$products.quantity" },
        totalRevenue: {
          $sum: {
            $multiply: ["$products.snapshot.price", "$products.quantity"],
          },
        },
        productName: { $first: "$products.snapshot.name" },
        productImage: { $first: "$products.snapshot.image" },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    {
      $addFields: {
        productDetails: { $arrayElemAt: ["$productDetails", 0] },
      },
    },
    {
      $project: {
        _id: 1,
        productId: "$_id",
        name: { $ifNull: ["$productName", "$productDetails.name"] },
        image: { $ifNull: ["$productImage", "$productDetails.images.0"] },
        totalSold: 1,
        totalRevenue: 1,
        category: "$productDetails.categoryId",
      },
    },
  ]);

  // ThÃªm thÃ´ng tin danh má»¥c
  for (let product of topProducts) {
    if (product.category) {
      const category = await Category.findById(product.category).select("name");
      product.categoryName = category ? category.name : "Unknown";
    } else {
      product.categoryName = "Unknown";
    }
  }

  return topProducts;
};

/**
 * Láº¥y thá»‘ng kÃª khÃ¡ch hÃ ng
 */
const getCustomerStatistics = async (period, startDate, endDate) => {
  let dateCondition = getDateCondition(period, startDate, endDate);

  // KhÃ¡ch hÃ ng má»›i trong khoáº£ng thá»i gian
  const newCustomers = await User.countDocuments({
    ...dateCondition,
    role: "customer",
  });

  // Top khÃ¡ch hÃ ng cÃ³ Ä‘Æ¡n hÃ ng nhiá»u nháº¥t
  const topCustomersByOrders = await Order.aggregate([
    { $match: dateCondition },
    {
      $group: {
        _id: "$userId",
        orderCount: { $sum: 1 },
        totalSpent: { $sum: "$totalPrice" },
      },
    },
    { $sort: { orderCount: -1 } },
    { $limit: 10 },
    {
      // Join
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    {
      // thÃªm trÆ°á»ng má»›i hoáº·c ghi Ä‘Ã¨ trÆ°á»ng hiá»‡n táº¡i báº±ng giÃ¡ trá»‹ tÃ­nh toÃ¡n.
      $addFields: {
        userDetails: { $arrayElemAt: ["$userDetails", 0] },
      },
    },
    {
      // Hiá»ƒn thá»‹ cÃ¡c trÆ°á»ng cáº§n thiáº¿t
      $project: {
        _id: 1,
        userId: "$_id",
        firstName: "$userDetails.firstName",
        lastName: "$userDetails.lastName",
        email: "$userDetails.email",
        phone: "$userDetails.phone",
        orderCount: 1,
        totalSpent: 1,
      },
    },
  ]);

  // Top khÃ¡ch hÃ ng chi tiÃªu nhiá»u nháº¥t
  const topCustomersBySpending = await Order.aggregate([
    {
      $match: {
        ...dateCondition,
        "payment.status": "Paid",
      },
    },
    {
      $group: {
        _id: "$userId",
        orderCount: { $sum: 1 },
        totalSpent: { $sum: "$totalPrice" },
      },
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    {
      $addFields: {
        userDetails: { $arrayElemAt: ["$userDetails", 0] },
      },
    },
    {
      $project: {
        _id: 1,
        userId: "$_id",
        firstName: "$userDetails.firstName",
        lastName: "$userDetails.lastName",
        email: "$userDetails.email",
        phone: "$userDetails.phone",
        orderCount: 1,
        totalSpent: 1,
      },
    },
  ]);

  return {
    newCustomers,
    topCustomersByOrders,
    topCustomersBySpending,
  };
};

/**
 * Láº¥y thá»‘ng kÃª theo danh má»¥c sáº£n pháº©m
 */
const getCategoryStatistics = async (period, startDate, endDate) => {
  let dateCondition = getDateCondition(period, startDate, endDate);

  const categoryStats = await Order.aggregate([
    {
      $match: {
        ...dateCondition,
        status: { $nin: ["Cancelled"] },
      },
    },
    { $unwind: "$products" },
    {
      $lookup: {
        from: "products",
        localField: "products.productId",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    {
      $addFields: {
        productDetails: { $arrayElemAt: ["$productDetails", 0] },
      },
    },
    {
      $group: {
        _id: "$productDetails.categoryId",
        totalSold: { $sum: "$products.quantity" },
        totalRevenue: {
          $sum: {
            $multiply: ["$products.snapshot.price", "$products.quantity"],
          },
        },
        orderCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "categoryDetails",
      },
    },
    {
      $addFields: {
        categoryDetails: { $arrayElemAt: ["$categoryDetails", 0] },
      },
    },
    {
      $project: {
        _id: 1,
        categoryId: "$_id",
        name: "$categoryDetails.name",
        totalSold: 1,
        totalRevenue: 1,
        orderCount: 1,
      },
    },
    { $sort: { totalRevenue: -1 } },
  ]);

  return categoryStats;
};

/**
 * Láº¥y thá»‘ng kÃª Ä‘Æ¡n hÃ ng
 */
const getOrderStatistics = async (period, startDate, endDate) => {
  let dateCondition = getDateCondition(period, startDate, endDate);
  let groupBy = {};
  let sortBy = {};

  // Äá»‹nh dáº¡ng group by dá»±a trÃªn period
  switch (period) {
    case "today":
      groupBy = {
        $hour: "$createdAt",
      };
      sortBy = { _id: 1 };
      break;
    case "week":
      groupBy = {
        $dayOfWeek: "$createdAt",
      };
      sortBy = { _id: 1 };
      break;
    case "month":
      groupBy = {
        $dayOfMonth: "$createdAt",
      };
      sortBy = { _id: 1 };
      break;
    case "year":
      groupBy = {
        $month: "$createdAt",
      };
      sortBy = { _id: 1 };
      break;
    case "custom":
      // Náº¿u khoáº£ng thá»i gian dÆ°á»›i 30 ngÃ y thÃ¬ group theo ngÃ y
      if (startDate && endDate) {
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);
        const dayDiff = Math.floor((parsedEndDate - parsedStartDate) / (1000 * 60 * 60 * 24));

        if (dayDiff <= 30) {
          groupBy = {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          };
        } else {
          groupBy = {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          };
        }
        sortBy = { _id: 1 };
      }
      break;
    default:
      groupBy = {
        $month: "$createdAt",
      };
      sortBy = { _id: 1 };
  }

  // Thá»‘ng kÃª sá»‘ lÆ°á»£ng Ä‘Æ¡n hÃ ng theo thá»i gian
  const ordersByTime = await Order.aggregate([
    { $match: dateCondition },
    {
      $group: {
        _id: groupBy,
        count: { $sum: 1 },
        revenue: { $sum: "$totalPrice" },
      },
    },
    { $sort: sortBy },
  ]);

  // Thá»‘ng kÃª theo tráº¡ng thÃ¡i Ä‘Æ¡n hÃ ng
  const ordersByStatus = await Order.aggregate([
    { $match: dateCondition },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        revenue: { $sum: "$totalPrice" },
      },
    },
  ]);

  // Tá»· lá»‡ Ä‘Æ¡n hÃ ng há»§y
  const totalOrders = await Order.countDocuments(dateCondition);
  const cancelledOrders = await Order.countDocuments({
    ...dateCondition,
    status: "Cancelled",
  });

  const cancellationRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;

  // Top lÃ½ do há»§y Ä‘Æ¡n
  const topCancellationReasons = await Order.aggregate([
    {
      $match: {
        ...dateCondition,
        status: "Cancelled",
        cancelReason: { $exists: true, $ne: null },
      },
    },
    {
      $group: {
        _id: "$cancelReason",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  return {
    ordersByTime,
    ordersByStatus,
    cancellationRate,
    topCancellationReasons,
  };
};

/**
 * Láº¥y thá»‘ng kÃª tá»“n kho
 */
const getInventoryStatistics = async () => {
  // Tá»•ng sáº£n pháº©m hiá»‡n cÃ³
  const totalProducts = await Product.countDocuments();

  // Tá»•ng sá»‘ lÆ°á»£ng tá»“n kho
  const inventoryResult = await Product.aggregate([
    { $unwind: "$variants" },
    { $group: { _id: null, totalStock: { $sum: "$variants.stock" } } },
  ]);
  const totalInventory = inventoryResult.length > 0 ? inventoryResult[0].totalStock : 0;

  // Sáº£n pháº©m gáº§n háº¿t hÃ ng (stock < 10)
  const lowStockProducts = await Product.aggregate([
    { $unwind: "$variants" },
    { $match: { "variants.stock": { $lt: 10, $gt: 0 } } },
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        totalLowStock: { $sum: 1 },
        variants: {
          $push: {
            id: "$variants._id",
            sku: "$variants.sku",
            size: "$variants.size",
            color: "$variants.color",
            stock: "$variants.stock",
          },
        },
      },
    },
    { $sort: { totalLowStock: -1 } },
  ]);

  // Sáº£n pháº©m Ä‘Ã£ háº¿t hÃ ng (stock = 0)
  const outOfStockProducts = await Product.aggregate([
    { $unwind: "$variants" },
    { $match: { "variants.stock": 0 } },
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        totalOutOfStock: { $sum: 1 },
        variants: {
          $push: {
            id: "$variants._id",
            sku: "$variants.sku",
            size: "$variants.size",
            color: "$variants.color",
          },
        },
      },
    },
    { $sort: { totalOutOfStock: -1 } },
  ]);

  // Sáº£n pháº©m theo sá»‘ lÆ°á»£ng tá»“n kho (phÃ¢n nhÃ³m)
  const stockDistribution = await Product.aggregate([
    { $unwind: "$variants" },
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              { case: { $eq: ["$variants.stock", 0] }, then: "Out of stock" },
              { case: { $lte: ["$variants.stock", 10] }, then: "Low stock (1-10)" },
              { case: { $lte: ["$variants.stock", 50] }, then: "Medium stock (11-50)" },
              { case: { $lte: ["$variants.stock", 100] }, then: "Good stock (51-100)" },
            ],
            default: "High stock (>100)",
          },
        },
        count: { $sum: 1 },
        products: { $addToSet: "$_id" },
      },
    },
    {
      $project: {
        stockLevel: "$_id", // Táº¡o trÆ°á»ng má»›i tÃªn lÃ  stockLevel, gÃ¡n giÃ¡ trá»‹ tá»« trÆ°á»ng _id.
        count: 1,
        uniqueProductCount: { $size: "$products" }, // Ä‘á»ƒ Ä‘áº¿m sá»‘ lÆ°á»£ng pháº§n tá»­ trong máº£ng products.
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return {
    totalProducts,
    totalInventory,
    lowStockProducts,
    outOfStockProducts,
    stockDistribution,
  };
};

export default {
  getOverviewStatistics,
  getRevenueStatistics,
  getTopProducts,
  getCustomerStatistics,
  getCategoryStatistics,
  getOrderStatistics,
  getInventoryStatistics,
};
