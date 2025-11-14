#!/usr/bin/env node

// Script tự động lấy IP và hiển thị hướng dẫn setup
import os from "os";

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

const IP = getLocalIP();
const DRONE_PORT = 5175;
const BACKEND_PORT = 5000;

console.log("\n🚁 ===============================================");
console.log("   DRONE SIMULATOR - SETUP INSTRUCTIONS");
console.log("================================================\n");

console.log("📡 Network Information:");
console.log(`   Local IP: ${IP}`);
console.log(`   Backend: http://${IP}:${BACKEND_PORT}`);
console.log(`   Drone Simulator: http://${IP}:${DRONE_PORT}\n`);

console.log("📱 Truy cập trên điện thoại:");
console.log(`   
   ┌─────────────────────────────────────┐
   │                                     │
   │   http://${IP}:${DRONE_PORT}   │
   │                                     │
   └─────────────────────────────────────┘
\n`);

console.log("✅ Các bước setup:");
console.log("   1. Đảm bảo Backend đang chạy (npm run dev ở folder BackEnd)");
console.log("   2. Chạy DroneSimulator (npm run dev ở folder này)");
console.log(
  `   3. Mở trình duyệt trên điện thoại, truy cập: http://${IP}:${DRONE_PORT}`
);
console.log("   4. Cho phép truy cập GPS khi được hỏi");
console.log("   5. Nhập Order ID và bắt đầu giao hàng\n");

console.log("⚠️  Lưu ý:");
console.log("   - Điện thoại và máy tính phải cùng mạng WiFi");
console.log("   - Tắt tường lửa nếu không kết nối được");
console.log("   - Bật GPS trên điện thoại\n");

console.log("🔧 Cập nhật CORS trong BackEnd/index.js:");
console.log(`
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://${IP}:5175",  // ⬅️ Thêm dòng này
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
      "http://${IP}:5175",  // ⬅️ Thêm dòng này
    ],
    credentials: true,
  })
);
\n`);

console.log("================================================\n");
