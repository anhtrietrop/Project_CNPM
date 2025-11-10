# 🍔 Food Delivery System with Drone & VNPay Integration

Hệ thống đặt đồ ăn trực tuyến với tính năng giao hàng bằng drone và thanh toán VNPay.

## 📋 Mục lục

- [Tính năng](#-tính-năng)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt](#-cài-đặt)
- [Chạy dự án](#-chạy-dự-án)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [API Documentation](#-api-documentation)
- [VNPay Testing](#-vnpay-testing)

---

## ✨ Tính năng

### 👤 Người dùng (User)

- ✅ Đăng ký/Đăng nhập (Firebase Auth)
- ✅ Tìm kiếm shop theo địa điểm
- ✅ Thêm món ăn vào giỏ hàng
- ✅ Thanh toán qua VNPay
- ✅ Theo dõi đơn hàng real-time
- ✅ Đánh giá món ăn

### 🏪 Chủ shop (Owner)

- ✅ Tạo và quản lý shop
- ✅ Thêm/Sửa/Xóa món ăn
- ✅ Quản lý kho (stock management)
- ✅ Xem danh sách đơn hàng
- ✅ Dashboard thống kê

### 🚁 Drone Delivery

- ✅ Giao hàng tự động bằng drone
- ✅ Tính toán khoảng cách và thời gian
- ✅ Quản lý drone pool

### 💳 Thanh toán VNPay

- ✅ Tích hợp VNPay Sandbox
- ✅ Xác thực chữ ký bảo mật
- ✅ Callback & IPN handling
- ✅ Trừ stock tự động sau thanh toán

---

## 🛠 Công nghệ sử dụng

### Backend

- **Node.js** v22+
- **Express.js** - REST API framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Firebase Admin** - Authentication
- **Cloudinary** - Image storage
- **Nodemailer** - Email service

### Frontend

- **React** 18+ với Vite
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Icons** - Icons

### Payment Gateway

- **VNPay Sandbox** - Payment integration

---

## 📦 Yêu cầu hệ thống

- **Node.js**: v18.0.0 trở lên (khuyến nghị v22+)
- **npm**: v9.0.0 trở lên
- **MongoDB**: v6.0 trở lên (local hoặc MongoDB Atlas)
- **Git**: v2.30 trở lên

---

## 🚀 Cài đặt

### 1️⃣ Clone repository

```powershell
git clone https://github.com/anhtrietrop/Project_CNPM.git
cd Project_CNPM
```

### 2️⃣ Cài đặt Backend

```powershell
cd BackEnd
npm install
```

**Tạo file `.env` trong thư mục `BackEnd`:**

```env
# Database
MONGO_URI=mongodb://localhost:27017/food-delivery
# hoặc sử dụng MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/food-delivery

# Server
PORT=8000
FRONTEND_URL=http://localhost:5173

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@firebase-project.iam.gserviceaccount.com

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email (Nodemailer)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# VNPay Sandbox
VNPAY_TMN_CODE=T465P0J7
VNPAY_HASH_SECRET=245VS8AWRG9LOCQ3A56MU8IKIX3NAJL9
```

### 3️⃣ Cài đặt Frontend

```powershell
cd ../FrontEnd
npm install
```

**Tạo file `.env` trong thư mục `FrontEnd`:**

```env
VITE_BACKEND_URL=http://localhost:8000

# Firebase Config
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

---

## 🎯 Chạy dự án

### Cách 1: Chạy riêng từng phần

#### Khởi động Backend

```powershell
cd BackEnd
node index.js
```

Backend sẽ chạy tại: **http://localhost:8000**

#### Khởi động Frontend (Terminal mới)

```powershell
cd FrontEnd
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:5173**

---

### Cách 2: Chạy đồng thời (khuyến nghị)

Sử dụng 2 terminal trong VS Code:

**Terminal 1 - Backend:**

```powershell
cd BackEnd ; node index.js
```

**Terminal 2 - Frontend:**

```powershell
cd FrontEnd ; npm run dev
```

---

## 📁 Cấu trúc thư mục

```
Project_CNPM/
├── BackEnd/
│   ├── config/           # Cấu hình (DB, VNPay, Firebase)
│   ├── controllers/      # Logic xử lý API
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── middlewares/      # Auth, upload middleware
│   ├── utils/            # Helper functions
│   ├── public/           # Static files
│   ├── index.js          # Entry point
│   └── package.json
│
├── FrontEnd/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── redux/        # Redux store & slices
│   │   ├── utils/        # Helper functions
│   │   ├── assets/       # Images, icons
│   │   ├── App.jsx       # Main App component
│   │   └── main.jsx      # Entry point
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## 📡 API Documentation

### Base URL

```
http://localhost:8000/api
```

### Endpoints chính

#### 🔐 Authentication

- `POST /auth/register` - Đăng ký tài khoản
- `POST /auth/login` - Đăng nhập
- `POST /auth/logout` - Đăng xuất
- `GET /auth/current-user` - Lấy thông tin user

#### 🏪 Shop

- `GET /shop/get-all` - Lấy tất cả shop
- `GET /shop/get-by-city/:city` - Lấy shop theo thành phố
- `POST /shop/create` - Tạo shop mới
- `POST /shop/edit/:shopId` - Chỉnh sửa shop

#### 🍕 Item (Food)

- `GET /item/get-all/:shopId` - Lấy món ăn của shop
- `GET /item/get-by-id/:itemId` - Lấy chi tiết món ăn
- `POST /item/create` - Thêm món ăn mới
- `POST /item/edit-item/:itemId` - Sửa món ăn
- `DELETE /item/delete/:itemId` - Xóa món ăn

#### 🛒 Cart

- `GET /cart/get` - Lấy giỏ hàng
- `POST /cart/add` - Thêm vào giỏ hàng
- `POST /cart/update` - Cập nhật số lượng
- `DELETE /cart/remove/:itemId` - Xóa khỏi giỏ hàng
- `DELETE /cart/clear` - Xóa toàn bộ giỏ hàng

#### 📦 Order

- `GET /order/my-orders` - Đơn hàng của user
- `GET /order/shop-orders` - Đơn hàng của shop
- `POST /order` - Tạo đơn hàng mới
- `PATCH /order/:orderId/status` - Cập nhật trạng thái

#### 💳 Payment

- `POST /payment/vnpay/create-payment-url` - Tạo URL thanh toán VNPay
- `GET /payment/vnpay/return` - Callback sau thanh toán
- `GET /payment/vnpay/ipn` - IPN notification từ VNPay

---

## 🧪 VNPay Testing

### Thông tin Sandbox

- **TMN Code:** `T465P0J7`
- **Hash Secret:** `245VS8AWRG9LOCQ3A56MU8IKIX3NAJL9`
- **Payment URL:** https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

### Thẻ test

| Ngân hàng | Số thẻ              | Tên          | Ngày hết hạn | OTP    |
| --------- | ------------------- | ------------ | ------------ | ------ |
| NCB       | 9704198526191432198 | NGUYEN VAN A | 07/15        | 123456 |

### Luồng thanh toán

1. User thêm món vào giỏ hàng
2. Nhấn **Checkout** → Tạo order với status="pending"
3. Chọn **Thanh toán VNPay** → Redirect đến VNPay
4. Nhập thông tin thẻ test → Hoàn tất thanh toán
5. VNPay callback về backend (`/vnpay/return`)
6. Backend tự động:
   - ✅ Cập nhật order status = "confirmed"
   - ✅ Cập nhật payment status = "paid"
   - ✅ Trừ stock của món ăn
   - ✅ Xóa giỏ hàng
7. Redirect về frontend hiển thị kết quả
8. Dashboard tự động refresh sau 30 giây

---

## 🐛 Troubleshooting

### Backend không kết nối được MongoDB

```powershell
# Kiểm tra MongoDB đang chạy
mongod --version

# Khởi động MongoDB (Windows)
net start MongoDB
```

### Frontend không gọi được API

- Kiểm tra `VITE_BACKEND_URL` trong `.env`
- Đảm bảo backend đang chạy tại port 8000
- Kiểm tra CORS settings trong backend

### VNPay trả về lỗi "Invalid signature"

- Kiểm tra `VNPAY_TMN_CODE` và `VNPAY_HASH_SECRET`
- Đảm bảo không có khoảng trắng thừa trong `.env`
- Xem log backend để debug signature

### Stock không bị trừ sau thanh toán

- Kiểm tra log backend: `📦 Stock updated for item...`
- Verify order có `orderStatus = "confirmed"`
- Check `item.stock` trong database

---

## 👥 Contributors

- **Anh Triet** - [@anhtrietrop](https://github.com/anhtrietrop)
- **Minh Thu** - [@Thuelsa](https://github.com/Thuelsa)