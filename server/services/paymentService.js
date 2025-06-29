const crypto = require("crypto");
const querystring = require("qs");
const dayjs = require("dayjs");
const axios = require("axios");
const { vnpayConfig } = require("../config/payment");

/**
 * Tạo URL thanh toán VNPay
 * @param {Object} order - Thông tin đơn hàng gồm amount, orderId, orderInfo
 * @returns {String} - URL thanh toán để chuyển hướng người dùng
 */
const createVnpayPaymentUrl = (order) => {
  try {
    const date = new Date();
    const createDate = dayjs(date).format("YYYYMMDDHHmmss");
    const orderId = order.orderId || `ORDER-${Date.now()}`;
    const amount = parseInt(order.amount) * 100; // VNPay yêu cầu amount * 100
    const orderDescription = order.orderInfo || `Thanh toan don hang ${orderId}`;

    let vnp_Params = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = vnpayConfig.vnp_TmnCode;
    vnp_Params["vnp_Locale"] = "vn";
    vnp_Params["vnp_CurrCode"] = "VND";
    vnp_Params["vnp_TxnRef"] = orderId;
    vnp_Params["vnp_OrderInfo"] = orderDescription;
    vnp_Params["vnp_OrderType"] = "other";
    vnp_Params["vnp_Amount"] = amount;
    vnp_Params["vnp_ReturnUrl"] = vnpayConfig.returnUrl;
    vnp_Params["vnp_IpAddr"] = "127.0.0.1";
    vnp_Params["vnp_CreateDate"] = createDate;

    vnp_Params = sortObject(vnp_Params);

    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;
    const paymentUrl = vnpayConfig.vnp_Url + "?" + querystring.stringify(vnp_Params, { encode: false });

    return paymentUrl;
  } catch (error) {
    console.error("Lỗi khi tạo URL thanh toán VNPay:", error);
    throw new Error("Không thể tạo URL thanh toán VNPay");
  }
};

/**
 * Xác minh kết quả thanh toán từ VNPay
 * @param {Object} vnpayParams - Tham số trả về từ VNPay
 * @returns {Object} - Kết quả xác minh
 */
const verifyVnpayReturn = (vnpayParams) => {
  try {
    let vnp_Params = { ...vnpayParams };
    const secureHash = vnp_Params["vnp_SecureHash"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);

    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    const isValid = secureHash === signed;

    return {
      isValid,
      orderId: vnpayParams.vnp_TxnRef,
      amount: parseInt(vnpayParams.vnp_Amount) / 100, // Chia cho 100 để trở lại số tiền gốc
      transactionNo: vnpayParams.vnp_TransactionNo,
      responseCode: vnpayParams.vnp_ResponseCode,
      transactionStatus: vnpayParams.vnp_TransactionStatus,
      payDate: vnpayParams.vnp_PayDate,
      bankCode: vnpayParams.vnp_BankCode,
    };
  } catch (error) {
    console.error("Lỗi khi xác minh kết quả thanh toán VNPay:", error);
    throw new Error("Không thể xác minh thanh toán VNPay");
  }
};

/**
 * Hàm tiện ích để sắp xếp đối tượng theo khóa
 * @param {Object} obj - Đối tượng cần sắp xếp
 * @returns {Object} - Đối tượng đã sắp xếp
 */
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

module.exports = {
  createVnpayPaymentUrl,
  verifyVnpayReturn,
};
