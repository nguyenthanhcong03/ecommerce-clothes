# Website Thương Mại Điện Tử - Outfitory

Đây là Đồ án tốt nghiệp của **Nguyễn Thành Công** với đề tài:  
**"Xây dựng Website bán quần áo cho Công ty Outfitory"**, được phát triển bằng **React.js** (Frontend) và **Node.js** (Backend).

### 1. Cài Đặt

Cài đặt cho Server:

cd server  
npm install

Cài đặt cho Client:

cd client  
npm install

### 2. Cấu Hình Environment

Tạo file `.env` trong thư mục `client` với nội dung sau:

`Endpoint API (VD: http://localhost:5000)`
VITE_API_URL=

Tạo file `.env` trong thư mục `server` với nội dung sau:

`Cổng server (VD: 5000)`
PORT=

`Môi trường (development | production)`
NODE_ENV=

`Chuỗi kết nối MongoDB`
MONGODB_URL=

`URL frontend (VD: http://localhost:5173)`
CLIENT_URL=

`URL backend (VD: http://localhost:5000)`
SERVER_URL=

`Chuỗi bí mật ký JWT`
JWT_SECRET=

`Thời gian hết hạn Access Token (VD: 15m, 1h)`
ACCESS_TOKEN_EXPIRES_IN=

`Thời gian hết hạn Refresh Token (VD: 7d, 30d)`
REFRESH_TOKEN_EXPIRES_IN=

`Thời gian sống của cookie Access Token (đơn vị: ngày)`
ACCESS_TOKEN_COOKIE_EXPIRES=

`Thời gian sống của cookie Refresh Token (đơn vị: ngày)`
REFRESH_TOKEN_COOKIE_EXPIRES=

`Cấu hình Email hệ thống`
EMAIL_USER=
EMAIL_PASS=

`Mật khẩu ứng dụng Gmail (nếu dùng Gmail gửi mail)`
GOOGLE_APP_PASSWORD=

`Cấu hình Cloudinary lưu trữ ảnh`
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

`API Key Gemini (Google AI)`
GEMINI_API_KEY=

### 3. Khởi Chạy Ứng Dụng

Chạy Backend:

cd server  
npm run dev

Chạy Frontend:

cd client  
npm run dev

## Địa Chỉ Truy Cập

Frontend: http://localhost:5173  
Backend: http://localhost:5000
