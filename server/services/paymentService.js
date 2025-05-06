const crypto = require("crypto");
const querystring = require("qs");
const moment = require("moment");
const axios = require("axios");
const { vnpayConfig } = require("../config/payment");

/**
 * Tạo URL thanh toán VNPay
 * @param {Object} orderInfo - Thông tin đơn hàng gồm amount, orderId, orderInfo
 * @returns {String} - URL thanh toán để chuyển hướng người dùng
 */
const createVnpayPaymentUrl = async (orderInfo) => {
  console.log("orderInfo", orderInfo);
  try {
    // Lấy ngày hiện tại theo múi giờ Việt Nam
    let createDate = moment(date).format("YYYYMMDDHHmmss");
    const orderId = orderInfo.orderId || `ORDER-${Date.now()}`;

    // Xây dựng dữ liệu thanh toán
    let vnpParams = {
      vnp_Version: "2.1.0", // Phiên bản API VNPay
      vnp_Command: "pay", // Lệnh thanh toán
      vnp_TmnCode: vnpayConfig.vnp_TmnCode, // Mã website của merchant
      vnp_Locale: "vn", // Ngôn ngữ
      vnp_CurrCode: "VND", // Tiền tệ
      vnp_TxnRef: orderId, // Mã tham chiếu giao dịch (mã đơn hàng)
      vnp_OrderInfo: orderInfo.orderInfo || `Payment for order ${orderId}`, // Thông tin mô tả đơn hàng
      vnp_OrderType: "other", // Loại hình thanh toán
      vnp_Amount: parseInt(orderInfo.amount) * 100, // Số tiền * 100 (VNPay yêu cầu x100)
      vnp_ReturnUrl: vnpayConfig.returnUrl, // URL nhận kết quả trả về
      vnp_IpAddr: orderInfo.ipAddr || "127.0.0.1", // IP của khách hàng
      vnp_CreateDate: createDate, // Ngày tạo giao dịch
    };

    // Sắp xếp tham số theo thứ tự a-z trước khi tạo chữ ký
    const sortedParams = sortObject(vnpParams);
    console.log("Sorted Params:", sortedParams);

    // Tạo chữ ký
    const signData = querystring.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    // Thêm chữ ký vào tham số
    vnpParams.vnp_SecureHash = signed;

    // Xây dựng URL thanh toán
    const paymentUrl = `${vnpayConfig.vnp_Url}?${querystring.stringify(vnpParams, { encode: false })}`;

    return paymentUrl;
  } catch (error) {
    console.error("Lỗi khi tạo URL thanh toán VNPay:", error);
    throw new Error("Không thể tạo URL thanh toán VNPay");
  }
};

/**
 * Xác minh kết quả thanh toán từ VNPay
 * @param {Object} vnpParams - Tham số trả về từ VNPay
 * @returns {Object} - Kết quả xác minh
 */
const verifyVnpayReturn = (vnpParams) => {
  console.log("voood", vnpParams);
  try {
    // Lấy chữ ký bảo mật từ request
    const secureHash = vnpParams.vnp_SecureHash;

    // Xóa hash khỏi tham số trước khi xác thực
    delete vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHashType;

    // Sắp xếp tham số theo thứ tự a-z
    const sortedParams = sortObject(vnpParams);

    // Tạo chữ ký
    const signData = querystring.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    // So sánh chữ ký
    const isValid = secureHash === signed;

    return {
      isValid, // Kết quả xác thực chữ ký
      orderId: vnpParams.vnp_TxnRef, // Mã đơn hàng
      amount: vnpParams.vnp_Amount / 100, // Số tiền (chuyển về đơn vị gốc)
      responseCode: vnpParams.vnp_ResponseCode, // Mã phản hồi
      bankCode: vnpParams.vnp_BankCode, // Mã ngân hàng
      bankTranNo: vnpParams.vnp_BankTranNo, // Mã giao dịch tại ngân hàng
      payDate: vnpParams.vnp_PayDate, // Ngày thanh toán
      transactionStatus: vnpParams.vnp_TransactionStatus, // Trạng thái giao dịch
      transactionNo: vnpParams.vnp_TransactionNo, // Mã giao dịch tại VNPay
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
