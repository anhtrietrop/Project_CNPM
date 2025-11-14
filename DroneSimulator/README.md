# 🚁 DroneSimulator - Hướng dẫn Setup trên Điện thoại

## 📱 Yêu cầu

- Điện thoại Android/iPhone có GPS
- Trình duyệt Chrome/Safari
- Điện thoại và máy tính phải cùng mạng WiFi

## 🔧 Bước 1: Cấu hình Backend cho mạng LAN

### Tìm địa chỉ IP máy tính

**Windows:**

```powershell
ipconfig
# Tìm dòng "IPv4 Address" (VD: 192.168.1.100)
```

**Mac/Linux:**

```bash
ifconfig
# Hoặc
ip addr show
```

### Cập nhật Backend

Sửa file `BackEnd\index.js`, thêm IP máy tính vào CORS:

```javascript
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://192.168.1.100:5175", // ⬅️ Thay IP của bạn
    ],
    credentials: true,
  },
});

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://192.168.1.100:5175", // ⬅️ Thay IP của bạn
    ],
    credentials: true,
  })
);
```

## 🚀 Bước 2: Chạy các Server

### Terminal 1 - Backend

```powershell
cd BackEnd
npm run dev
# Server chạy ở port 5000
```

### Terminal 2 - DroneSimulator

```powershell
cd DroneSimulator
npm install  # Chỉ chạy lần đầu
npm run dev
```

Vite sẽ hiển thị:

```
Local:   http://localhost:5175/
Network: http://192.168.1.100:5175/
```

## 📱 Bước 3: Truy cập trên Điện thoại

1. **Mở trình duyệt trên điện thoại**
2. **Nhập địa chỉ Network** (VD: `http://192.168.1.100:5175`)
3. **Cho phép truy cập GPS** khi trình duyệt hỏi
4. **Thêm vào Home Screen** (Tùy chọn):
   - **iPhone**: Nhấn Share → "Add to Home Screen"
   - **Android**: Menu → "Add to Home Screen"

## 🎮 Bước 4: Sử dụng

### Lấy Order ID từ hệ thống:

1. Vào trang Shop Owner (Frontend)
2. Xem đơn hàng đang "preparing"
3. Copy Order ID

### Trên điện thoại:

1. Nhập Order ID vào ô input
2. Nhấn "Bắt đầu giao hàng"
3. Cho phép GPS
4. Di chuyển điện thoại → Vị trí sẽ được cập nhật real-time
5. Mã xác nhận sẽ hiển thị để đưa cho khách

## 🔍 Troubleshooting

### Không kết nối được?

- ✅ Kiểm tra điện thoại và máy tính cùng WiFi
- ✅ Tắt tường lửa Windows tạm thời
- ✅ Kiểm tra Backend đang chạy
- ✅ Thử dùng HTTP thay vì HTTPS

### GPS không hoạt động?

- ✅ Bật Location Services trên điện thoại
- ✅ Cho phép trình duyệt truy cập vị trí
- ✅ Thử đứng ngoài trời để GPS chính xác hơn

### HTTPS Required (iOS Safari)?

Trên iOS, GPS có thể yêu cầu HTTPS. Giải pháp:

1. Sử dụng Chrome trên iOS
2. Hoặc setup HTTPS với ngrok:

```bash
npx ngrok http 5175
# Sử dụng URL ngrok trên điện thoại
```

## 🔄 Cập nhật Backend URL trong App

Nếu backend không chạy ở port 5000, sửa file `DroneSimulator\src\App.jsx`:

```javascript
const BACKEND_URL = "http://192.168.1.100:5000"; // ⬅️ Thay IP:PORT
```

## 📊 Test Real-time Tracking

1. **Máy tính**: Mở trang User Orders
2. **Điện thoại**: Chạy Drone Simulator
3. **Di chuyển điện thoại** → Vị trí sẽ hiển thị trên User Orders real-time

## 🎯 Port Summary

- **Backend**: 5000
- **Frontend (User)**: 5173
- **Frontend (Shop/Admin)**: 5174
- **DroneSimulator**: 5175

---

**Lưu ý**: Giữ màn hình điện thoại luôn sáng khi đang giao hàng để GPS không bị tắt.
