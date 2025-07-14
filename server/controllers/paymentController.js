const dayjs = require("dayjs");
const Order = require("../models/order");
const { createVnpayPaymentUrl, verifyVnpayReturn, createVnpayRefund } = require("../services/paymentService");
const catchAsync = require("../utils/catchAsync");

/**
 * Tạo URL thanh toán cho VNPay
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
    console.error("Lỗi khi tạo thanh toán VNPays:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Không thể tạo liên kết thanh toán VNPay",
    });
  }
};

/**
 * Xử lý URL trả về từ VNPay
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
      // Thanh toán thành công - cập nhật đã thanh toán, chuyển hướng đến trang thành công
      await Order.findOneAndUpdate(
        { _id: orderId },
        {
          status: "Pending",
          payment: {
            method: "VNPay",
            status: "Paid",
            paidAt: new Date(),
            transactionNo: verificationResult.transactionNo,
          },
        }
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

const vnpayRefund = catchAsync(async (req, res) => {
  const { orderId, reason } = req.body;
  const userId = req.user._id;
  const userRole = req.user.role;

  if (!orderId) {
    throw new ApiError(400, "Mã đơn hàng là bắt buộc");
  }

  let query = { _id: orderId };

  // Nếu người dùng không phải là admin, chỉ hoàn tiền đơn hàng của họ
  if (userRole !== "admin") {
    query.userId = userId;
  }

  const order = await Order.findOne(query);

  if (!order) {
    throw new ApiError(404, "Không tìm thấy đơn hàng hoặc bạn không có quyền truy cập");
  }

  // Kiểm tra điều kiện hoàn tiền
  if (order.payment.status !== "Paid") {
    throw new ApiError(400, "Đơn hàng chưa được thanh toán, không thể hoàn tiền");
  }

  if (order.payment.status === "Refunded") {
    throw new ApiError(400, "Đơn hàng đã được hoàn tiền trước đó");
  }

  let refundInfo = null;

  try {
    if (order.payment.method === "VNPay") {
      // Kiểm tra transactionNo cho VNPay
      if (!order.payment.transactionNo) {
        throw new ApiError(400, "Không tìm thấy thông tin giao dịch VNPay, không thể hoàn tiền");
      }

      // Tạo yêu cầu hoàn tiền VNPay
      const refundData = {
        orderId: orderId,
        transactionNo: order.payment.transactionNo,
        amount: order.totalPrice,
        refundAmount: order.totalPrice,
        reason: reason || `Hoàn tiền đơn hàng ${orderId}`,
        transactionDate: order.payment.paidAt ? dayjs(order.payment.paidAt).format("YYYYMMDDHHmmss") : null,
        createBy: req.user.username || "System",
      };

      const refundResult = await createVnpayRefund(refundData);

      if (!refundResult.success) {
        throw new ApiError(400, `Hoàn tiền VNPay thất bại: ${refundResult.message}`);
      }

      // Chỉ cập nhật trạng thái khi hoàn tiền thành công
      order.payment.status = "Refunded";
      order.payment.refundedAt = new Date();
      order.payment.refundRequestId = refundResult.requestId;
      order.payment.refundTransactionNo = refundResult.transactionNo;

      await order.save();

      refundInfo = {
        method: "VNPay",
        amount: order.totalPrice,
        requestId: refundResult.requestId,
        transactionNo: refundResult.transactionNo,
        refundedAt: order.payment.refundedAt,
        responseCode: refundResult.responseCode,
        message: refundResult.message,
      };
    } else if (order.payment.method === "COD") {
      // Đối với COD, chỉ cập nhật trạng thái (hoàn tiền thủ công)
      order.payment.status = "Refunded";
      order.payment.refundedAt = new Date();
      await order.save();

      refundInfo = {
        method: "COD",
        amount: order.totalPrice,
        note: "Hoàn tiền thủ công cho đơn hàng COD",
        refundedAt: order.payment.refundedAt,
      };
    } else {
      throw new ApiError(400, "Phương thức thanh toán không hỗ trợ hoàn tiền tự động");
    }

    res.status(200).json({
      success: true,
      message: `Hoàn tiền thành công ${refundInfo.amount.toLocaleString("vi-VN")}đ qua ${refundInfo.method}`,
      data: {
        orderId: orderId,
        refund: refundInfo,
        order: order,
      },
    });
  } catch (error) {
    console.error("Lỗi khi hoàn tiền:", error);

    // Nếu là lỗi từ VNPay, trả về thông báo cụ thể
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, `Lỗi hệ thống khi hoàn tiền: ${error.message}`);
  }
});

/**
 * Kiểm tra trạng thái hoàn tiền
 */
const checkRefundStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

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

    return res.status(200).json({
      success: true,
      data: {
        orderId: orderId,
        paymentStatus: order.payment?.status || "Unpaid",
        paidAt: order.payment?.paidAt || null,
        refundedAt: order.payment?.refundedAt || null,
        transactionNo: order.payment?.transactionNo || null,
        orderStatus: order.status,
      },
    });
  } catch (error) {
    console.error("Lỗi khi kiểm tra trạng thái hoàn tiền:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Không thể kiểm tra trạng thái hoàn tiền",
    });
  }
};

module.exports = {
  createVnpayPayment,
  vnpayReturn,
  vnpayRefund,
  checkRefundStatus,
};
