const crypto = require("crypto");
const querystring = require("qs");
const moment = require("moment");
const axios = require("axios");
const { vnpayConfig, momoConfig } = require("../config/payment");

/**
 * Tạo URL thanh toán VNPay
 * @param {Object} order - Thông tin đơn hàng gồm amount, orderId, orderInfo
 * @returns {String} - URL thanh toán để chuyển hướng người dùng
 */
const createVnpayPaymentUrl = (order) => {
  try {
    const date = new Date();
    const createDate = moment(date).format("YYYYMMDDHHmmss");
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
 * Tạo URL thanh toán MoMo
 * @param {Object} orderInfo - Thông tin đơn hàng gồm amount, orderId, orderInfo
 * @returns {String} - URL thanh toán để chuyển hướng người dùng
 */
const createMomoPaymentUrl = async (orderInfo) => {
  try {
    const requestId = `REQ-${Date.now()}`; // Mã yêu cầu thanh toán
    const orderId = orderInfo.orderId || `ORDER-${Date.now()}`; // Mã đơn hàng
    const amount = parseInt(orderInfo.amount); // Số tiền thanh toán
    const orderDescription = orderInfo.orderInfo || `Payment for order ${orderId}`; // Mô tả đơn hàng

    // Chuẩn bị chuỗi dữ liệu để tạo chữ ký
    const rawSignature =
      `partnerCode=${momoConfig.partnerCode}&` +
      `accessKey=${momoConfig.accessKey}&` +
      `requestId=${requestId}&` +
      `amount=${amount}&` +
      `orderId=${orderId}&` +
      `orderInfo=${orderDescription}&` +
      `redirectUrl=${momoConfig.redirectUrl}&` +
      `ipnUrl=${momoConfig.ipnUrl}&` +
      `extraData=`;

    // Tạo chữ ký
    const signature = crypto.createHmac("sha256", momoConfig.secretKey).update(rawSignature).digest("hex");

    // Tạo body request
    const requestBody = {
      partnerCode: momoConfig.partnerCode, // Mã đối tác
      accessKey: momoConfig.accessKey, // Khóa truy cập
      requestId: requestId, // Mã yêu cầu
      amount: amount, // Số tiền
      orderId: orderId, // Mã đơn hàng
      orderInfo: orderDescription, // Thông tin đơn hàng
      redirectUrl: momoConfig.redirectUrl, // URL redirect
      ipnUrl: momoConfig.ipnUrl, // URL nhận thông báo
      extraData: "", // Dữ liệu thêm (để trống)
      requestType: "captureWallet", // Loại yêu cầu
      signature: signature, // Chữ ký
      lang: "vi", // Ngôn ngữ
    };

    // Gửi request đến MoMo
    const response = await axios.post(momoConfig.endpoint, requestBody);

    // Trả về URL thanh toán nếu thành công
    if (response.data && response.data.payUrl) {
      return response.data.payUrl;
    } else {
      throw new Error("Không nhận được URL thanh toán từ MoMo");
    }
  } catch (error) {
    console.error("Lỗi khi tạo URL thanh toán MoMo:", error);
    throw new Error("Không thể tạo URL thanh toán MoMo");
  }
};

/**
 * Xác minh kết quả thanh toán từ MoMo
 * @param {Object} momoParams - Tham số trả về từ MoMo
 * @returns {Object} - Kết quả xác minh
 */
const verifyMomoReturn = (momoParams) => {
  try {
    // Tạo chuỗi raw signature từ tham số trả về
    const rawSignature =
      `accessKey=${momoConfig.accessKey}&` +
      `amount=${momoParams.amount}&` +
      `extraData=${momoParams.extraData || ""}&` +
      `message=${momoParams.message}&` +
      `orderId=${momoParams.orderId}&` +
      `orderInfo=${momoParams.orderInfo}&` +
      `orderType=${momoParams.orderType}&` +
      `partnerCode=${momoParams.partnerCode}&` +
      `payType=${momoParams.payType}&` +
      `requestId=${momoParams.requestId}&` +
      `responseTime=${momoParams.responseTime}&` +
      `resultCode=${momoParams.resultCode}&` +
      `transId=${momoParams.transId}`;

    // Tạo chữ ký
    const signature = crypto.createHmac("sha256", momoConfig.secretKey).update(rawSignature).digest("hex");

    // So sánh chữ ký
    const isValid = signature === momoParams.signature;

    return {
      isValid, // Kết quả xác thực chữ ký
      orderId: momoParams.orderId, // Mã đơn hàng
      amount: parseInt(momoParams.amount), // Số tiền
      transId: momoParams.transId, // Mã giao dịch tại MoMo
      resultCode: momoParams.resultCode, // Mã kết quả
      message: momoParams.message, // Thông báo
      payType: momoParams.payType, // Phương thức thanh toán
      responseTime: momoParams.responseTime, // Thời gian phản hồi
    };
  } catch (error) {
    console.error("Lỗi khi xác minh kết quả thanh toán MoMo:", error);
    throw new Error("Không thể xác minh thanh toán MoMo");
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
  createMomoPaymentUrl,
  verifyMomoReturn,
};
