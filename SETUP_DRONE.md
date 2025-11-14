# 🚁 HƯỚNG DẪN NHANH - Chạy Drone Simulator trên Điện thoại

## Bước 1: Chạy npm setup để xem IP

```powershell
cd DroneSimulator
npm run setup
```

Script sẽ hiển thị IP máy tính và link truy cập.

## Bước 2: Chạy Backend

```powershell
# Terminal 1
cd BackEnd
npm run dev
```

## Bước 3: Chạy DroneSimulator

```powershell
# Terminal 2
cd DroneSimulator
npm install  # Chỉ lần đầu
npm run dev
```

Vite sẽ hiển thị:

```
➜  Local:   http://localhost:5175/
➜  Network: http://192.168.x.x:5175/  ⬅️ Dùng link này
```

## Bước 4: Trên điện thoại

1. **Kết nối cùng WiFi** với máy tính
2. **Mở Chrome/Safari**
3. **Truy cập** địa chỉ Network (ví dụ: `http://192.168.1.100:5175`)
4. **Cho phép GPS** khi trình duyệt hỏi

## Bước 5: Test

### Lấy Order ID:

1. Vào trang Shop Owner (http://localhost:5174)
2. Đăng nhập với tài khoản shop
3. Vào "Đơn hàng của tôi"
4. Chọn đơn đang "preparing"
5. Assign drone cho đơn hàng
6. Copy Order ID (mã đơn hàng)

### Trên điện thoại:

1. Dán Order ID vào ô input
2. Nhấn "Bắt đầu giao hàng"
3. Mã xác nhận 6 số sẽ hiển thị
4. Di chuyển điện thoại → Vị trí real-time được cập nhật

## ⚠️ Lưu ý

- ✅ Bật GPS trên điện thoại
- ✅ Cho phép trình duyệt truy cập vị trí
- ✅ Tắt tường lửa Windows nếu không kết nối được
- ✅ Giữ màn hình luôn sáng khi đang giao hàng

## 🔧 Nếu không kết nối được

### Windows Firewall:

1. Mở Windows Defender Firewall
2. "Allow an app through firewall"
3. Tìm "Node.js" và check cả Private và Public
4. Hoặc tắt tường lửa tạm thời để test

### Kiểm tra Backend:

```powershell
# Mở PowerShell
curl http://localhost:5000
# Phải có response
```

### Test từ điện thoại:

Mở trình duyệt điện thoại, truy cập:

```
http://[IP_MÁY_TÍNH]:5000
```

Nếu thấy "Cannot GET /" là OK.

## 📊 Tổng kết Port

| Service             | Port     | URL (Máy tính)            | URL (Điện thoại)            |
| ------------------- | -------- | ------------------------- | --------------------------- |
| Backend             | 5000     | http://localhost:5000     | http://192.168.x.x:5000     |
| User Frontend       | 5173     | http://localhost:5173     | http://192.168.x.x:5173     |
| Shop/Admin          | 5174     | http://localhost:5174     | http://192.168.x.x:5174     |
| **Drone Simulator** | **5175** | **http://localhost:5175** | **http://192.168.x.x:5175** |

---

## 🎯 Flow hoàn chỉnh

1. User đặt hàng → Order status: "pending"
2. Shop Owner xác nhận → Order status: "confirmed"
3. Shop Owner chuẩn bị món → Order status: "preparing"
4. **Shop Owner assign drone** → Order status: "delivering" + tạo confirmCode
5. **Drone Simulator** nhận Order ID → Hiển thị confirmCode
6. **GPS tracking real-time** → User thấy vị trí drone
7. **Drone đến nơi** → Đưa confirmCode cho user
8. **User nhập mã** → Order status: "completed"

Done! 🎉
