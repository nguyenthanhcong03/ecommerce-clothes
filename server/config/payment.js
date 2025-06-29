// Cấu hình VNPay
const vnpayConfig = {
  vnp_TmnCode: "3NNZLDO2", // Mã website của merchant trên hệ thống của VNPay
  vnp_HashSecret: "T6GYXQSQFDA7L51ZWKZYTYGO8BX24KZG", // Chuỗi bí mật để tạo chữ ký
  vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html", // URL thanh toán VNPay
  returnUrl: "http://localhost:5000/api/payment/vnpay/return", // URL nhận kết quả trả về từ VNPay
};

// Cấu hình client URL
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

module.exports = { vnpayConfig, CLIENT_URL };
