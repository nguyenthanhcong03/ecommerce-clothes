const Order = require("../models/order");
const { createVnpayPaymentUrl, verifyVnpayReturn } = require("../services/paymentService");

/**
 * Tạo URL thanh toán cho VNPay
 * @route POST /api/payment/vnpay/create
 * @access Private - Cần đăng nhập
 */
const createVnpayPayment = async (req, res) => {
  console.log("đên đến đây rồi nè");
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Mã đơn hàng không được để trống",
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Đơn hàng không tồn tại",
      });
    }

    // Tạo URL thanh toán
    const paymentUrl = createVnpayPaymentUrl({
      amount: order.totalPrice,
      orderId: orderId,
      orderInfo: `Thanh toán đơn hàng ${orderId}`,
    });

    return res.status(200).json({
      success: true,
      paymentUrl,
    });
  } catch (error) {
    console.log("đên đến đây rồi nè2");

    console.error("Lỗi khi tạo thanh toán VNPays:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Không thể tạo liên kết thanh toán VNPay",
    });
  }
};

/**
 * Xử lý URL trả về từ VNPay
 * @route GET /api/payment/vnpay/return
 * @access Public - Công khai
 */
const vnpayReturn = async (req, res) => {
  try {
    // Lấy tất cả các tham số truy vấn từ VNPay
    const vnpayParams = req.query;

    // Xác minh dữ liệu thanh toán
    const verificationResult = verifyVnpayReturn(vnpayParams);
    const orderId = vnpayParams.vnp_TxnRef;

    // Kiểm tra xem thanh toán có thành công hay không
    if (verificationResult.isValid && verificationResult.responseCode === "00") {
      console.log("ahahhahahahah");
      // Thanh toán thành công - cập nhật đã thanh toán, chuyển hướng đến trang thành công
      await Order.findOneAndUpdate(
        { _id: orderId },
        { status: "Pending", payment: { isPaid: true, paidAt: new Date() } }
      );
      const redirectUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/payment-success?orderId=${
        verificationResult.orderId
      }&amount=${verificationResult.amount}&paymentMethod=VNPay&transactionNo=${verificationResult.transactionNo}`;
      return res.redirect(redirectUrl);
    } else {
      // Thanh toán thất bại - xóa thông tin tạm thời
      let failureReason = "Lỗi không xác định";

      // Ánh xạ mã phản hồi VNPay thành thông báo thân thiện
      const responseCodeMap = {
        "01": "Giao dịch chưa hoàn tất",
        "02": "Giao dịch bị lỗi",
        "04": "Giao dịch đảo (Khách hàng đã bị trừ tiền tại Ngân hàng nhưng GD chưa thành công ở VNPAY)",
        "05": "VNPAY đang xử lý giao dịch này (GD có thể thành công hoặc thất bại)",
        "06": "VNPAY đã gửi yêu cầu hoàn tiền sang Ngân hàng",
        "07": "Giao dịch bị nghi ngờ gian lận",
        "09": "GD Hoàn trả bị từ chối",
        10: "Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
        11: "Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch",
        12: "Thẻ/Tài khoản của khách hàng bị khóa",
        13: "Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)",
        24: "Khách hàng hủy giao dịch",
        51: "Tài khoản của quý khách không đủ số dư để thực hiện giao dịch",
        65: "Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày",
        75: "Ngân hàng thanh toán đang bảo trì",
        79: "KH nhập sai mật khẩu thanh toán quá số lần quy định",
        99: "Các lỗi khác",
      };

      if (responseCodeMap[verificationResult.responseCode]) {
        failureReason = responseCodeMap[verificationResult.responseCode];
      }

      // Chuyển hướng đến trang thất bại với thông tin lỗi
      const redirectUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/payment-failed?orderId=${
        verificationResult.orderId
      }&reason=${encodeURIComponent(failureReason)}&paymentMethod=VNPay`;
      return res.redirect(redirectUrl);
    }
  } catch (error) {
    console.error("Lỗi khi xử lý kết quả trả về từ VNPay:", error);
    const redirectUrl = `${
      process.env.CLIENT_URL || "http://localhost:5173"
    }/payment-failed?reason=server_error&paymentMethod=VNPay`;
    return res.redirect(redirectUrl);
  }
};

module.exports = {
  createVnpayPayment,
  vnpayReturn,
};
