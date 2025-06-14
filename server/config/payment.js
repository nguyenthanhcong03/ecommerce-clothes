// Cấu hình VNPay
const vnpayConfig = {
  vnp_TmnCode: "3NNZLDO2", // Mã website của merchant trên hệ thống của VNPay
  vnp_HashSecret: "T6GYXQSQFDA7L51ZWKZYTYGO8BX24KZG", // Chuỗi bí mật để tạo chữ ký
  vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html", // URL thanh toán VNPay
  returnUrl: "http://localhost:5000/api/payment/vnpay/return", // URL nhận kết quả trả về từ VNPay
};

// Cấu hình Momo
const momoConfig = {
  partnerCode: "YOUR_PARTNER_CODE", // Mã đối tác trên hệ thống của MoMo
  accessKey: "YOUR_ACCESS_KEY", // Khóa truy cập MoMo cấp
  secretKey: "YOUR_SECRET_KEY", // Khóa bí mật để tạo chữ ký
  redirectUrl: "http://localhost:5000/api/payment/momo/return", // URL nhận kết quả trả về từ MoMo
  ipnUrl: "http://localhost:5000/api/payment/momo/ipn", // URL nhận thông báo kết quả giao dịch từ MoMo
  endpoint: "https://test-payment.momo.vn/v2/gateway/api/create", // URL tạo giao dịch thanh toán MoMo
};

// Cấu hình client URL
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

module.exports = { vnpayConfig, momoConfig, CLIENT_URL };
