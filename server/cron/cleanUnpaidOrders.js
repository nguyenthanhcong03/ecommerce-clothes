const cron = require("node-cron");
const Order = require("../models/order");
const Product = require("../models/product");
const Coupon = require("../models/coupon");

// Tự động xóa sau 10 phút
cron.schedule("*/30 * * * *", async () => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const orders = await Order.find({
      status: "Unpaid",
      createdAt: { $lt: oneDayAgo },
    });

    for (const order of orders) {
      // 1. Cập nhật lại stock cho từng biến thể
      for (const item of order.products) {
        const { productId, variantId, quantity } = item;

        await Product.updateOne(
          { _id: productId, "variants._id": variantId },
          {
            $inc: { "variants.$.stock": quantity },
          }
        );
        // $inc: là toán tử MongoDB để cộng thêm giá trị cho một field.
        // "variants.$.stock":
        // variants.$ là toán tử positional ($) dùng để trỏ đến phần tử khớp đầu tiên trong mảng variants (ở điều kiện tìm kiếm).
        // .stock: field bạn muốn cập nhật (ở trong mỗi variant).
        // Vậy nghĩa là: Cộng thêm quantity vào stock của variant có variantId được chỉ định.
      }

      // 2. Giảm lượt dùng mã giảm giá nếu có
      if (order.couponCode) {
        await Coupon.findOneAndUpdate({ code: order.couponApplied }, { $inc: { usedCount: -1 } });
      }

      // 3. Xoá đơn hàng
      await Order.findByIdAndDelete(order._id);
    }

    console.log(`[Cron] Đã xoá ${orders.length} đơn hàng chưa thanh toán đã tạo hơn 1 giờ trước`);
  } catch (err) {
    console.error("[Cron] Lỗi khi xóa đơn hàng chưa thanh toán:", err);
  }
});
