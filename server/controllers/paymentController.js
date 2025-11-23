import dayjs from "dayjs";
import Order from "../models/order.js";
import paymentService from "../services/paymentService.js";
import ApiError from "../utils/ApiError.js";
import catchAsync from "../utils/catchAsync.js";
import { responseSuccess } from "../utils/responseHandler.js";

/**
 * Tạo yêu cầu thanh toán VNPay
 */
const createVnpayPayment = catchAsync(async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Đơn hàng không tồn tại");

  // Táº¡o URL thanh toÃ¡n
  const paymentUrl = paymentService.createVnpayPaymentUrl({
    amount: order.totalPrice,
    orderId: orderId,
    orderInfo: `Thanh toán đơn hàng: ${orderId}`,
  });

  responseSuccess(res, 200, "Tạo liên kết thanh toán VNPay thành công", paymentUrl);
});

/**
 * Xử lý kết quả trả về từ VNPay
 */
const vnpayReturn = catchAsync(async (req, res) => {
  // Lấy tham số trả về từ VNPay
  const vnpayParams = req.query;

  // Xác minh tính hợp lệ của dữ liệu trả về
  const verificationResult = verifyVnpayReturn(vnpayParams);
  const orderId = vnpayParams.vnp_TxnRef;

  // Kiểm tra xem thanh toán thành công hay thất bại
  if (verificationResult.isValid && verificationResult.responseCode === "00") {
    // Thanh toán thành công - cập nhật trạng thái đơn hàng
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
    // Thanh toán thất bại - xác định lý do
    let failureReason = "Lỗi không xác định";

    // Ánh xạ mã lỗi trả về từ VNPay sang lý do cụ thể
    const responseCodeMap = {
      "01": "Giao dá»‹ch chÆ°a hoÃ n táº¥t",
      "02": "Giao dá»‹ch bá»‹ lá»—i",
      "04": "Giao dá»‹ch Ä‘áº£o (KhÃ¡ch hÃ ng Ä‘Ã£ bá»‹ trá»« tiá»n táº¡i NgÃ¢n hÃ ng nhÆ°ng GD chÆ°a thÃ nh cÃ´ng á»Ÿ VNPAY)",
      "05": "VNPAY Ä‘ang xá»­ lÃ½ giao dá»‹ch nÃ y (GD cÃ³ thá»ƒ thÃ nh cÃ´ng hoáº·c tháº¥t báº¡i)",
      "06": "VNPAY Ä‘Ã£ gá»­i yÃªu cáº§u hoÃ n tiá»n sang NgÃ¢n hÃ ng",
      "07": "Giao dá»‹ch bá»‹ nghi ngá» gian láº­n",
      "09": "GD HoÃ n tráº£ bá»‹ tá»« chá»‘i",
      10: "KhÃ¡ch hÃ ng xÃ¡c thá»±c thÃ´ng tin tháº»/tÃ i khoáº£n khÃ´ng Ä‘Ãºng quÃ¡ 3 láº§n",
      11: "ÄÃ£ háº¿t háº¡n chá» thanh toÃ¡n. Xin quÃ½ khÃ¡ch vui lÃ²ng thá»±c hiá»‡n láº¡i giao dá»‹ch",
      12: "Tháº»/TÃ i khoáº£n cá»§a khÃ¡ch hÃ ng bá»‹ khÃ³a",
      13: "QuÃ½ khÃ¡ch nháº­p sai máº­t kháº©u xÃ¡c thá»±c giao dá»‹ch (OTP)",
      24: "KhÃ¡ch hÃ ng há»§y giao dá»‹ch",
      51: "TÃ i khoáº£n cá»§a quÃ½ khÃ¡ch khÃ´ng Ä‘á»§ sá»‘ dÆ° Ä‘á»ƒ thá»±c hiá»‡n giao dá»‹ch",
      65: "TÃ i khoáº£n cá»§a QuÃ½ khÃ¡ch Ä‘Ã£ vÆ°á»£t quÃ¡ háº¡n má»©c giao dá»‹ch trong ngÃ y",
      75: "NgÃ¢n hÃ ng thanh toÃ¡n Ä‘ang báº£o trÃ¬",
      79: "KH nháº­p sai máº­t kháº©u thanh toÃ¡n quÃ¡ sá»‘ láº§n quy Ä‘á»‹nh",
      99: "CÃ¡c lá»—i khÃ¡c",
    };

    if (responseCodeMap[verificationResult.responseCode]) {
      failureReason = responseCodeMap[verificationResult.responseCode];
    }

    // Chuyển hướng đến trang thanh toán thất bại
    const redirectUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/payment-failed?orderId=${
      verificationResult.orderId
    }&reason=${encodeURIComponent(failureReason)}&paymentMethod=VNPay`;
    return res.redirect(redirectUrl);
  }
});

const vnpayRefund = catchAsync(async (req, res) => {
  const { orderId, reason } = req.body;
  const userId = req.user._id;
  const userRole = req.user.role;

  if (!orderId) {
    throw new ApiError(400, "MÃ£ Ä‘Æ¡n hÃ ng lÃ  báº¯t buá»™c");
  }

  let query = { _id: orderId };

  // Náº¿u ngÆ°á»i dÃ¹ng khÃ´ng pháº£i lÃ  admin, chá»‰ hoÃ n tiá»n Ä‘Æ¡n hÃ ng cá»§a há»
  if (userRole !== "admin") {
    query.userId = userId;
  }

  const order = await Order.findOne(query);

  if (!order) {
    throw new ApiError(404, "KhÃ´ng tÃ¬m tháº¥y Ä‘Æ¡n hÃ ng hoáº·c báº¡n khÃ´ng cÃ³ quyá»n truy cáº­p");
  }

  // Kiá»ƒm tra Ä‘iá»u kiá»‡n hoÃ n tiá»n
  if (order.payment.status !== "Paid") {
    throw new ApiError(400, "ÄÆ¡n hÃ ng chÆ°a Ä‘Æ°á»£c thanh toÃ¡n, khÃ´ng thá»ƒ hoÃ n tiá»n");
  }

  if (order.payment.status === "Refunded") {
    throw new ApiError(400, "ÄÆ¡n hÃ ng Ä‘Ã£ Ä‘Æ°á»£c hoÃ n tiá»n trÆ°á»›c Ä‘Ã³");
  }

  let refundInfo = null;

  try {
    if (order.payment.method === "VNPay") {
      // Kiá»ƒm tra transactionNo cho VNPay
      if (!order.payment.transactionNo) {
        throw new ApiError(400, "KhÃ´ng tÃ¬m tháº¥y thÃ´ng tin giao dá»‹ch VNPay, khÃ´ng thá»ƒ hoÃ n tiá»n");
      }

      // Táº¡o yÃªu cáº§u hoÃ n tiá»n VNPay
      const refundData = {
        orderId: orderId,
        transactionNo: order.payment.transactionNo,
        amount: order.totalPrice,
        refundAmount: order.totalPrice,
        reason: reason || `HoÃ n tiá»n Ä‘Æ¡n hÃ ng ${orderId}`,
        transactionDate: order.payment.paidAt ? dayjs(order.payment.paidAt).format("YYYYMMDDHHmmss") : null,
        createBy: req.user.username || "System",
      };

      const refundResult = await createVnpayRefund(refundData);

      if (!refundResult.success) {
        throw new ApiError(400, `HoÃ n tiá»n VNPay tháº¥t báº¡i: ${refundResult.message}`);
      }

      // Chá»‰ cáº­p nháº­t tráº¡ng thÃ¡i khi hoÃ n tiá»n thÃ nh cÃ´ng
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
      // Äá»‘i vá»›i COD, chá»‰ cáº­p nháº­t tráº¡ng thÃ¡i (hoÃ n tiá»n thá»§ cÃ´ng)
      order.payment.status = "Refunded";
      order.payment.refundedAt = new Date();
      await order.save();

      refundInfo = {
        method: "COD",
        amount: order.totalPrice,
        note: "HoÃ n tiá»n thá»§ cÃ´ng cho Ä‘Æ¡n hÃ ng COD",
        refundedAt: order.payment.refundedAt,
      };
    } else {
      throw new ApiError(400, "PhÆ°Æ¡ng thá»©c thanh toÃ¡n khÃ´ng há»— trá»£ hoÃ n tiá»n tá»± Ä‘á»™ng");
    }

    res.status(200).json({
      success: true,
      message: `HoÃ n tiá»n thÃ nh cÃ´ng ${refundInfo.amount.toLocaleString("vi-VN")}Ä‘ qua ${refundInfo.method}`,
      data: {
        orderId: orderId,
        refund: refundInfo,
        order: order,
      },
    });
  } catch (error) {
    console.error("Lá»—i khi hoÃ n tiá»n:", error);

    // Náº¿u lÃ  lá»—i tá»« VNPay, tráº£ vá» thÃ´ng bÃ¡o cá»¥ thá»ƒ
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, `Lá»—i há»‡ thá»‘ng khi hoÃ n tiá»n: ${error.message}`);
  }
});

/**
 * Kiá»ƒm tra tráº¡ng thÃ¡i hoÃ n tiá»n
 */
const checkRefundStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "MÃ£ Ä‘Æ¡n hÃ ng khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng",
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "ÄÆ¡n hÃ ng khÃ´ng tá»“n táº¡i",
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
    console.error("Lá»—i khi kiá»ƒm tra tráº¡ng thÃ¡i hoÃ n tiá»n:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "KhÃ´ng thá»ƒ kiá»ƒm tra tráº¡ng thÃ¡i hoÃ n tiá»n",
    });
  }
};

export default {
  createVnpayPayment,
  vnpayReturn,
  vnpayRefund,
  checkRefundStatus,
};
