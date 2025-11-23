import axios from "axios";
import { Buffer } from "buffer";
import crypto from "crypto";
import dayjs from "dayjs";
import querystring from "qs";
import { vnpayConfig } from "../config/payment.js";

/**
 * Tạo URL thanh toán VNPay
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
    console.error("Lỗi khi tạo liên kết thanh toán VNPay:", error);
    throw new Error("Lỗi khi tạo liên kết thanh toán VNPay");
  }
};

/**
 * Xác minh kết quả thanh toán VNPay
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
      amount: parseInt(vnpayParams.vnp_Amount) / 100, // Chia cho 100
      transactionNo: vnpayParams.vnp_TransactionNo,
      responseCode: vnpayParams.vnp_ResponseCode,
      transactionStatus: vnpayParams.vnp_TransactionStatus,
      payDate: vnpayParams.vnp_PayDate,
      bankCode: vnpayParams.vnp_BankCode,
    };
  } catch (error) {
    console.error("Lỗi khi xác minh kết quả thanh toán VNPay:", error);
    throw new Error("Lỗi khi xác minh kết quả thanh toán VNPay");
  }
};

/**
 * Tạo yêu cầu hoàn tiền VNPay
 */
const createVnpayRefund = async (refundData) => {
  try {
    const { orderId, transactionNo, amount, refundAmount, reason, refundOrderId, transactionDate, createBy } =
      refundData;

    const date = new Date();
    const createDate = dayjs(date).format("YYYYMMDDHHmmss");
    const requestId = dayjs(date).format("HHmmss");
    const refundAmountInVND = parseInt(refundAmount) * 100;
    const transactionType = refundAmount === amount ? "02" : "03"; // 02: HoÃ n tiá»n toÃ n pháº§n, 03: HoÃ n tiá»n má»™t pháº§n

    // Äáº£m báº£o transactionDate cÃ³ giÃ¡ trá»‹, náº¿u khÃ´ng thÃ¬ dÃ¹ng createDate
    const vnpTransactionDate = transactionDate || createDate;

    // Táº¡o chuá»—i dá»¯ liá»‡u Ä‘á»ƒ táº¡o secure hash theo format cá»§a VNPay
    const data = `${requestId}|2.1.0|refund|${
      vnpayConfig.vnp_TmnCode
    }|${transactionType}|${orderId}|${refundAmountInVND}|${transactionNo || "0"}|${vnpTransactionDate}|${
      createBy || "System"
    }|${createDate}|127.0.0.1|${reason || `Hoan tien GD ma:${orderId}`}`;

    const hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret);
    const vnp_SecureHash = hmac.update(Buffer.from(data, "utf-8")).digest("hex");

    const dataObj = {
      vnp_RequestId: requestId,
      vnp_Version: "2.1.0",
      vnp_Command: "refund",
      vnp_TmnCode: vnpayConfig.vnp_TmnCode,
      vnp_TransactionType: transactionType,
      vnp_TxnRef: orderId,
      vnp_Amount: refundAmountInVND,
      vnp_TransactionNo: transactionNo || "0",
      vnp_CreateBy: createBy || "System",
      vnp_OrderInfo: reason || `Hoan tien GD ma:${orderId}`,
      vnp_TransactionDate: vnpTransactionDate,
      vnp_CreateDate: createDate,
      vnp_IpAddr: "127.0.0.1",
      vnp_SecureHash: vnp_SecureHash,
    };
    console.log("dataObj", dataObj);

    // Gá»­i yÃªu cáº§u hoÃ n tiá»n Ä‘áº¿n VNPay
    const refundUrl = vnpayConfig.vnp_Api || "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction";

    const response = await axios.post(refundUrl, dataObj, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("VNPay refund response:", response.data);

    return {
      success: response.data.vnp_ResponseCode === "00",
      responseCode: response.data.vnp_ResponseCode,
      message: getRefundResponseMessage(response.data.vnp_ResponseCode),
      requestId: requestId,
      transactionNo: response.data.vnp_TransactionNo,
      refundAmount: refundAmount,
      data: response.data,
    };
  } catch (error) {
    console.error("Lá»—i khi táº¡o yÃªu cáº§u hoÃ n tiá»n VNPay:", error);
    throw new Error("KhÃ´ng thá»ƒ táº¡o yÃªu cáº§u hoÃ n tiá»n VNPay");
  }
};

/**
 * Lấy thông báo
 */
const getRefundResponseMessage = (responseCode) => {
  const messages = {
    "00": "Giao dá»‹ch thÃ nh cÃ´ng",
    "01": "ÄÆ¡n hÃ ng khÃ´ng tá»“n táº¡i",
    "02": "Merchant khÃ´ng há»£p lá»‡",
    "03": "Dá»¯ liá»‡u gá»­i sang khÃ´ng Ä‘Ãºng Ä‘á»‹nh dáº¡ng",
    "04": "Sá»‘ tiá»n khÃ´ng há»£p lá»‡",
    "05": "Giao dá»‹ch khÃ´ng thÃ nh cÃ´ng",
    "06": "Giao dá»‹ch khÃ´ng tá»“n táº¡i",
    "07": "Trá»« tiá»n thÃ nh cÃ´ng. Giao dá»‹ch bá»‹ nghi ngá»",
    "08": "Giao dá»‹ch Ä‘Ã£ Ä‘Æ°á»£c xá»­ lÃ½",
    "09": "Giao dá»‹ch khÃ´ng thÃ nh cÃ´ng",
    10: "Giao dá»‹ch khÃ´ng thÃ nh cÃ´ng",
    11: "ÄÃ£ háº¿t háº¡n chá» thanh toÃ¡n",
    12: "Tháº»/TÃ i khoáº£n bá»‹ khÃ³a",
    13: "Máº­t kháº©u OTP khÃ´ng Ä‘Ãºng",
    24: "Giao dá»‹ch bá»‹ há»§y",
    51: "TÃ i khoáº£n khÃ´ng Ä‘á»§ sá»‘ dÆ°",
    65: "VÆ°á»£t quÃ¡ háº¡n má»©c giao dá»‹ch",
    75: "NgÃ¢n hÃ ng Ä‘ang báº£o trÃ¬",
    79: "Nháº­p sai máº­t kháº©u quÃ¡ sá»‘ láº§n quy Ä‘á»‹nh",
    91: "KhÃ´ng tÃ¬m tháº¥y giao dá»‹ch yÃªu cáº§u",
    93: "ÄÃ£ hoÃ n tiá»n má»™t pháº§n",
    94: "YÃªu cáº§u hoÃ n tiá»n bá»‹ tá»« chá»‘i",
    95: "Giao dá»‹ch Ä‘Ã£ Ä‘Æ°á»£c hoÃ n tiá»n",
    97: "Chá»¯ kÃ½ khÃ´ng há»£p lá»‡",
    98: "Timeout",
    99: "Lá»—i khÃ´ng xÃ¡c Ä‘á»‹nh",
  };

  return messages[responseCode] || "Lá»—i khÃ´ng xÃ¡c Ä‘á»‹nh";
};

/**
 * HÃ m tiá»‡n Ã­ch Ä‘á»ƒ sáº¯p xáº¿p Ä‘á»‘i tÆ°á»£ng theo khÃ³a
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

export default { createVnpayPaymentUrl, verifyVnpayReturn, createVnpayRefund };
