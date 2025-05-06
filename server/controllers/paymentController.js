const { vnpayConfig } = require("../config/payment");
const {
  createVnpayPaymentUrl,
  verifyVnpayReturn,
  createMomoPaymentUrl,
  verifyMomoReturn,
} = require("../services/paymentService");
const moment = require("moment");
const Order = require("../models/order");

/**
 * Tạo URL thanh toán cho VNPay
 * @route POST /api/payment/vnpay/create
 * @access Private - Cần đăng nhập
 */
const createVnpayPayment = async (req, res) => {
  try {
    const { amount, orderInfo, orderId } = req.body;
    console.log("amount", amount);
    console.log("orderInfo", orderInfo);
    console.log("orderId", orderId);

    // Kiểm tra tính hợp lệ của đầu vào
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Số tiền thanh toán không hợp lệ" });
    }

    // Lấy địa chỉ IP của khách hàng
    let ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    // Tạo URL thanh toán
    const paymentUrl = await createVnpayPaymentUrl({
      amount,
      orderInfo,
      orderId,
      ipAddr,
    });

    return res.status(200).json({
      success: true,
      paymentUrl,
    });
  } catch (error) {
    console.error("Lỗi khi tạo thanh toán VNPay:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Không thể tạo liên kết thanh toán",
    });
  }
};

const createVnpayPayment2 = async (req, res) => {
  // const { amount, orderInfo, orderId } = req.body;
  process.env.TZ = "Asia/Ho_Chi_Minh";

  let date = new Date();
  let createDate = moment(date).format("YYYYMMDDHHmmss");

  let ipAddr =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  let tmnCode = vnpayConfig.vnp_TmnCode;
  let secretKey = vnpayConfig.vnp_HashSecret;
  let vnpUrl = vnpayConfig.vnp_Url;
  let returnUrl = vnpayConfig.returnUrl;
  let orderId = req.body.orderId || moment(date).format("DDHHmmss");
  let amount = Number(req.body.amount);
  let bankCode = req.body.bankCode || "NCB" || "VNPAYQR";

  let locale = req.body.language;
  if (locale === null || locale === "" || locale === undefined) {
    locale = "vn";
  }
  let currCode = "VND";
  let vnp_Params = {};
  vnp_Params["vnp_Version"] = "2.1.0";
  vnp_Params["vnp_Command"] = "pay";
  vnp_Params["vnp_TmnCode"] = tmnCode;
  vnp_Params["vnp_Locale"] = locale;
  vnp_Params["vnp_CurrCode"] = currCode;
  vnp_Params["vnp_TxnRef"] = orderId;
  vnp_Params["vnp_OrderInfo"] = "Thanh toan cho ma GD:" + orderId;
  vnp_Params["vnp_OrderType"] = "other";
  vnp_Params["vnp_Amount"] = amount * 100;
  vnp_Params["vnp_ReturnUrl"] = returnUrl;
  vnp_Params["vnp_IpAddr"] = ipAddr;
  vnp_Params["vnp_CreateDate"] = createDate;
  if (bankCode !== null && bankCode !== "") {
    vnp_Params["vnp_BankCode"] = bankCode;
  }

  vnp_Params = sortObject(vnp_Params);
  console.log("sortedParams", vnp_Params);

  let querystring = require("qs");
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let crypto = require("crypto");
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;
  vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

  res.json({
    status: "success",
    message: "URL thanh toán đã được tạo",
    data: {
      paymentUrl: vnpUrl,
      orderId: orderId,
      amount: amount,
      createDate: createDate,
    },
  });
};

const vnpayReturn2 = async (req, res) => {
  let vnp_Params = req.query;

  let secureHash = vnp_Params["vnp_SecureHash"];

  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  vnp_Params = sortObject(vnp_Params);

  let tmnCode = vnpayConfig.vnp_TmnCode;
  let secretKey = vnpayConfig.vnp_HashSecret;

  let querystring = require("qs");
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let crypto = require("crypto");
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  if (secureHash === signed) {
    // Giao dịch thành công
    // Lấy mã đơn hàng và số tiền
    const orderId = vnp_Params["vnp_TxnRef"];
    const amount = parseInt(vnp_Params["vnp_Amount"]) / 100; // Chuyển về đơn vị gốc

    if (vnp_Params["vnp_ResponseCode"] === "00") {
      try {
        // Cập nhật trạng thái đơn hàng trong cơ sở dữ liệu
        await Order.findByIdAndUpdate(orderId, {
          "payment.method": "VNPay",
          "payment.isPaid": true,
          "payment.paidAt": new Date(),
        });

        // Lưu thông tin giao dịch chi tiết nếu cần
        // Có thể lưu vnp_Params vào một collection riêng nếu cần theo dõi chi tiết

        // Chuyển hướng đến trang thành công
        return res.redirect(
          `${process.env.FRONTEND_URL}/payment-success?orderId=${orderId}&amount=${amount}&paymentMethod=vnpay`
        );
      } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
        return res.redirect(`${process.env.FRONTEND_URL}/payment-failed?reason=server_error&paymentMethod=vnpay`);
      }
    } else {
      // Giao dịch thất bại - Ánh xạ mã phản hồi VNPay thành thông báo thân thiện
      let failureReason = "Lỗi không xác định";

      // Ánh xạ mã phản hồi VNPay thành thông báo thân thiện
      const responseCodeMap = {
        "01": "Giao dịch chưa hoàn tất",
        "02": "Lỗi giao dịch",
        "04": "Số tiền không hợp lệ",
        13: "Giao dịch không hợp lệ",
        24: "Khách hàng hủy giao dịch",
        51: "Số dư tài khoản không đủ",
        65: "Vượt quá hạn mức giao dịch",
        75: "Ngân hàng đang bảo trì",
        79: "OTP không hợp lệ",
        99: "Kết nối timed out",
      };

      if (responseCodeMap[vnp_Params["vnp_ResponseCode"]]) {
        failureReason = responseCodeMap[vnp_Params["vnp_ResponseCode"]];
      }

      // Chuyển hướng đến trang thất bại với thông tin lỗi
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment-failed?orderId=${orderId}&reason=${failureReason}&paymentMethod=vnpay`
      );
    }
  } else {
    // Chữ ký không hợp lệ
    return res.redirect(`${process.env.FRONTEND_URL}/payment-failed?reason=invalid_signature&paymentMethod=vnpay`);
  }
};

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

/**
 * Xử lý URL trả về từ VNPay
 * @route GET /api/payment/vnpay/return
 * @access Public - Công khai
 */
const vnpayReturn = async (req, res) => {
  try {
    // Lấy tất cả các tham số truy vấn từ VNPay
    const vnpParams = req.query;

    // Xác minh dữ liệu thanh toán
    const verificationResult = verifyVnpayReturn(vnpParams);

    // Kiểm tra xem thanh toán có thành công hay không
    if (verificationResult.isValid && vnpParams.vnp_ResponseCode === "00") {
      // Thanh toán thành công - cập nhật trạng thái đơn hàng
      // Cập nhật trạng thái đơn hàng trong cơ sở dữ liệu

      // Chuyển hướng đến trang thành công với thông tin thanh toán
      return res.redirect(
        `/payment-success?orderId=${verificationResult.orderId}&amount=${verificationResult.amount}&paymentMethod=vnpay`
      );
    } else {
      // Thanh toán thất bại
      let failureReason = "Lỗi không xác định";

      // Ánh xạ mã phản hồi VNPay thành thông báo thân thiện
      const responseCodeMap = {
        "01": "Giao dịch chưa hoàn tất",
        "02": "Lỗi giao dịch",
        "04": "Số tiền không hợp lệ",
        13: "Giao dịch không hợp lệ",
        24: "Khách hàng hủy giao dịch",
        51: "Số dư tài khoản không đủ",
        65: "Vượt quá hạn mức giao dịch",
        75: "Ngân hàng đang bảo trì",
        79: "OTP không hợp lệ",
        99: "Kết nối timed out",
      };

      if (responseCodeMap[vnpParams.vnp_ResponseCode]) {
        failureReason = responseCodeMap[vnpParams.vnp_ResponseCode];
      }

      // Chuyển hướng đến trang thất bại với thông tin lỗi
      return res.redirect(
        `/payment-failed?orderId=${verificationResult.orderId}&reason=${failureReason}&paymentMethod=vnpay`
      );
    }
  } catch (error) {
    console.error("Lỗi khi xử lý kết quả trả về từ VNPay:", error);
    return res.redirect("/payment-failed?reason=server_error&paymentMethod=vnpay");
  }
};

/**
 * Tạo URL thanh toán cho MoMo
 * @route POST /api/payment/momo/create
 * @access Private - Cần đăng nhập
 */
const createMomoPayment = async (req, res) => {
  try {
    const { amount, orderInfo, orderId } = req.body;

    // Kiểm tra tính hợp lệ của đầu vào
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Số tiền thanh toán không hợp lệ" });
    }

    // Tạo URL thanh toán
    const paymentUrl = await createMomoPaymentUrl({
      amount,
      orderInfo,
      orderId,
    });

    return res.status(200).json({
      success: true,
      paymentUrl,
    });
  } catch (error) {
    console.error("Lỗi khi tạo thanh toán MoMo:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Không thể tạo liên kết thanh toán",
    });
  }
};

/**
 * Xử lý URL trả về từ MoMo
 * @route GET /api/payment/momo/return
 * @access Public - Công khai
 */
const momoReturn = async (req, res) => {
  try {
    // Lấy tất cả các tham số truy vấn từ MoMo
    const momoParams = req.query;

    // Xác minh dữ liệu thanh toán
    const verificationResult = verifyMomoReturn(momoParams);

    // Kiểm tra xem thanh toán có thành công hay không
    if (verificationResult.isValid && verificationResult.resultCode === "0") {
      // Thanh toán thành công - cập nhật trạng thái đơn hàng
      // Cập nhật trạng thái đơn hàng trong cơ sở dữ liệu

      // Chuyển hướng đến trang thành công với thông tin thanh toán
      return res.redirect(
        `/payment-success?orderId=${verificationResult.orderId}&amount=${verificationResult.amount}&paymentMethod=momo`
      );
    } else {
      // Thanh toán thất bại
      let failureReason = "Lỗi không xác định";

      // Ánh xạ mã kết quả MoMo thành thông báo thân thiện
      const resultCodeMap = {
        1001: "Không tìm thấy đơn hàng",
        1002: "Đơn hàng đã được xác nhận",
        1003: "Giao dịch hết hạn",
        1004: "Số tiền không hợp lệ",
        1005: "Giao dịch không hợp lệ",
        1006: "Giao dịch đã bị hủy",
        1007: "Giao dịch thất bại",
      };

      if (resultCodeMap[verificationResult.resultCode]) {
        failureReason = resultCodeMap[verificationResult.resultCode];
      }

      // Chuyển hướng đến trang thất bại với thông tin lỗi
      return res.redirect(
        `/payment-failed?orderId=${verificationResult.orderId}&reason=${failureReason}&paymentMethod=momo`
      );
    }
  } catch (error) {
    console.error("Lỗi khi xử lý kết quả trả về từ MoMo:", error);
    return res.redirect("/payment-failed?reason=server_error&paymentMethod=momo");
  }
};

/**
 * Xử lý IPN (Instant Payment Notification) từ MoMo
 * @route POST /api/payment/momo/ipn
 * @access Public - Công khai, webhook từ MoMo
 */
const momoIpn = async (req, res) => {
  try {
    // Lấy tất cả các tham số từ MoMo IPN
    const momoParams = req.body;

    // Xác minh dữ liệu thanh toán
    const verificationResult = verifyMomoReturn(momoParams);

    // Kiểm tra xem thanh toán có thành công hay không
    if (verificationResult.isValid && verificationResult.resultCode === "0") {
      // Thanh toán thành công - cập nhật trạng thái đơn hàng
      // Cập nhật trạng thái đơn hàng trong cơ sở dữ liệu

      // Trả về thành công cho MoMo
      return res.status(200).json({ status: "success" });
    } else {
      // Thanh toán thất bại
      return res.status(200).json({ status: "failed", message: "Xác minh thanh toán thất bại" });
    }
  } catch (error) {
    console.error("Lỗi khi xử lý MoMo IPN:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports = {
  createVnpayPayment,
  createVnpayPayment2,
  vnpayReturn,
  vnpayReturn2,
  createMomoPayment,
  momoReturn,
  momoIpn,
};
