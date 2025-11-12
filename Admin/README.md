# Admin Dashboard - Food Delivery System

Admin dashboard chạy độc lập trên **localhost:5174** để quản lý hệ thống.

## 🚀 Cách chạy

```bash
npm run dev
```

Dashboard sẽ chạy trên: http://localhost:5174

## 📋 Chức năng

### 1. Đăng nhập Admin

- Chỉ tài khoản có role="admin" mới đăng nhập được
- Sử dụng email/password đã tạo trong database

### 2. Dashboard (Trang chủ)

- Thống kê tổng quan: Users, Shops, Orders, Revenue
- Hiển thị số Drone đang hoạt động/nhàn rỗi
- Cảnh báo Shop chờ duyệt

### 3. User Management

- Xem danh sách tất cả users
- Lọc theo role: All / User / Owner / Admin
- Tìm kiếm theo tên, email, phone
- Xóa user (không xóa được admin)

### 4. Shop Management ⭐ QUAN TRỌNG

- Xem danh sách nhà hàng
- Lọc: All / Chờ duyệt / Đã duyệt
- **Duyệt nhà hàng**: Nhà hàng mới xuất hiện trên User Dashboard
- **Từ chối**: Yêu cầu nhập lý do từ chối
- Xóa nhà hàng đã duyệt

## 🔄 Quy trình duyệt Shop

1. **Owner tạo shop** → Shop có `isApproved: false` (mặc định)
2. **Owner thấy banner vàng** "Đang chờ Admin duyệt" → Không thể thêm món
3. **Admin vào Shop Management** → Xem shop chờ duyệt
4. **Admin duyệt** → Shop có `isApproved: true`
5. **Shop xuất hiện trên User Dashboard** → Owner có thể thêm món

## ⚠️ Lưu ý

- Admin dashboard **PHẢI** chạy cùng Backend (port 8000)
- Backend đã config CORS cho port 5174
- Chỉ shop `isApproved: true` mới hiện cho user
- Owner không thể add món khi shop chưa được duyệt

## 🎯 Tech Stack

- **React 18** + **Vite**
- **Redux Toolkit** - State management
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Icons** - Icons

## 📝 API Endpoints sử dụng

```
GET  /api/admin/stats          - Thống kê dashboard
GET  /api/admin/users          - Danh sách users
DELETE /api/admin/users/:id    - Xóa user

GET  /api/admin/shops          - Danh sách shops
PUT  /api/admin/shops/:id/approve  - Duyệt shop
PUT  /api/admin/shops/:id/reject   - Từ chối shop
DELETE /api/admin/shops/:id    - Xóa shop
```

## 👤 Tạo tài khoản Admin

Nếu chưa có admin, tạo trong MongoDB:

```javascript
{
  fullName: "Admin",
  email: "admin@example.com",
  password: "$2a$10$...", // Hash password
  role: "admin",
  phone: "0123456789"
}
```

Hoặc đăng ký user thường, sau đó update role:

```javascript
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } });
```
