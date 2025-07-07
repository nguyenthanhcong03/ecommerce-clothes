# Website Thương Mại Điện Tử (E-Commerce)

Đây là Đồ án tốt nghiệp của Nguyễn Thành Công với đề tài "Xây dựng Website bán quần áo cho Công ty Outfitory" được xây dựng với React.js và Node.js.

## Cài Đặt và Khởi Chạy

### 1. Cài Đặt

<!-- Cài đặt dependencies cho server -->

cd server
npm install

<!-- Cài đặt dependencies cho client -->

cd ../client
npm install

### 2. Cấu Hình Environment

Tạo file `.env` trong thư mục server:

<!-- Cổng server chạy (VD: 5000) -->

PORT=

<!-- Môi trường hiện tại (development | production) -->

NODE_ENV=

<!-- Chuỗi kết nối MongoDB -->

MONGODB_URL=

<!-- URL frontend client (VD: http://localhost:5173) -->

CLIENT_URL=

<!-- URL server backend (VD: http://localhost:5000) -->

SERVER_URL=

<!-- Chuỗi bí mật để ký JWT -->

JWT_SECRET=

<!-- Thời gian hết hạn access token (VD: 15m, 1h) -->

ACCESS_TOKEN_EXPIRES_IN=

<!-- Thời gian hết hạn refresh token (VD: 7d, 30d) -->

REFRESH_TOKEN_EXPIRES_IN=

<!-- Thời gian tồn tại cookie chứa access token (đơn vị: ngày) -->

ACCESS_TOKEN_COOKIE_EXPIRES=

<!-- Thời gian tồn tại cookie chứa refresh token (đơn vị: ngày) -->

REFRESH_TOKEN_COOKIE_EXPIRES=

<!-- Cấu hình gửi email -->

EMAIL_USER=
EMAIL_PASS=

<!-- Mật khẩu ứng dụng Google (dùng khi gửi mail qua Gmail) -->

GOOGLE_APP_PASSWORD=

<!-- Cấu hình Cloudinary để lưu trữ ảnh -->

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

<!-- API Key của Gemini (Google AI) -->

GEMINI_API_KEY=

### 3. Khởi Chạy Ứng Dụng

<!-- Khởi chạy server (trong thư mục server) -->

npm run dev

<!-- Khởi chạy client (trong thư mục client) -->

npm run dev

Ứng dụng sẽ có thể truy cập tại:

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
