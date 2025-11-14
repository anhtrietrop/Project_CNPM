import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const BACKEND_URL = "http://localhost:8000";

function App() {
  const [socket, setSocket] = useState(null);
  const [droneId, setDroneId] = useState("");
  const [droneSerial, setDroneSerial] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [droneInfo, setDroneInfo] = useState(null);
  const [orderId, setOrderId] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [battery, setBattery] = useState(100);
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [address, setAddress] = useState("Chưa có vị trí");
  const [status, setStatus] = useState("Chưa xác thực");

  useEffect(() => {
    const newSocket = io(BACKEND_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      setIsConnected(true);
      if (isAuthenticated) {
        setStatus("Đã kết nối");
      }
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);
      setStatus("Mất kết nối");
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // Listen for drone assignment from backend
    newSocket.on("drone-assigned", (data) => {
      console.log("Drone assigned event received:", data);
      
      // Check if this assignment is for current drone
      if (droneInfo && data.droneId === droneInfo._id) {
        setOrderId(data.orderId);
        setConfirmCode(data.confirmCode);
        setStatus(`Nhận đơn mới! Khoảng cách: ${data.deliveryDistance?.toFixed(2)} km`);
        
        // Auto start tracking
        setTimeout(() => {
          setIsTracking(true);
          setStatus("Đang giao hàng...");
        }, 1000);
      }
    });

    setSocket(newSocket);

    return () => {
      console.log("Cleaning up socket connection");
      newSocket.close();
    };
  }, [droneInfo]); // Add droneInfo dependency to listen for assignment

  const handleAuthenticateDrone = async () => {
    if (!droneId || !droneSerial) {
      alert("Vui lòng nhập Drone ID và Serial Number");
      return;
    }

    try {
      // Verify drone exists and is available
      const response = await fetch(`${BACKEND_URL}/api/drone/verify/${droneId}`);
      
      if (!response.ok) {
        throw new Error("Drone không tồn tại");
      }

      const result = await response.json();
      
      // Check if drone data exists (API returns { success: true, data: drone })
      if (!result || !result.data) {
        throw new Error("Không thể lấy thông tin drone");
      }

      const drone = result.data;
      
      // Verify serial number
      if (!drone.serialNumber || drone.serialNumber !== droneSerial) {
        throw new Error("Serial Number không đúng");
      }

      // Allow login for both "available" and "busy" drones
      // (busy means drone is already assigned to an order)
      if (drone.status !== "available" && drone.status !== "busy") {
        throw new Error("Drone không khả dụng");
      }

      setDroneInfo(drone);
      setBattery(drone.battery?.current || 100);
      setIsAuthenticated(true);
      
      // If drone is busy, check for active order
      if (drone.status === "busy") {
        try {
          const orderResponse = await fetch(`${BACKEND_URL}/api/order/drone/${droneId}`);
          if (orderResponse.ok) {
            const orderData = await orderResponse.json();
            if (orderData.order) {
              setOrderId(orderData.order._id);
              setConfirmCode(orderData.order.confirmCode);
              setStatus(`Đã nhận đơn! Khoảng cách: ${orderData.order.deliveryDistance?.toFixed(2) || 0} km`);
              
              // Auto start tracking after 1 second
              setTimeout(() => {
                setIsTracking(true);
                setStatus("Đang giao hàng...");
              }, 1000);
            } else {
              setStatus("Đã xác thực - Sẵn sàng");
            }
          } else {
            setStatus("Đã xác thực - Sẵn sàng");
          }
        } catch (err) {
          console.error("Error fetching order:", err);
          setStatus("Đã xác thực - Sẵn sàng");
        }
      } else {
        setStatus("Đã xác thực - Sẵn sàng");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      alert("Lỗi xác thực: " + error.message);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setDroneInfo(null);
    setOrderId("");
    setConfirmCode("");
    setIsTracking(false);
    setStatus("Chưa xác thực");
  };

  // Get real-time location from device
  useEffect(() => {
    if (!isTracking || !orderId) return;

    // Join order room for this delivery
    if (socket) {
      socket.emit("join-order", orderId);
      console.log(`Joined order room: ${orderId}`);
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        setLocation(newLocation);

        // Reverse geocoding to get address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLocation.lat}&lon=${newLocation.lng}&zoom=18&addressdetails=1`,
            {
              headers: {
                "User-Agent": "FastFoodDrone/1.0",
              },
            }
          );
          const data = await response.json();
          if (data.display_name) {
            setAddress(data.display_name);
          }
        } catch (error) {
          console.error("Geocoding error:", error);
        }

        // Send location to server
        if (socket && orderId) {
          socket.emit("drone-location-update", {
            orderId,
            location: newLocation,
          });
        }
      },
      (error) => {
        console.error("Location error:", error);
        setStatus("Lỗi GPS: " + error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      // Leave order room when stop tracking
      if (socket && orderId) {
        socket.emit("leave-order", orderId);
        console.log(`Left order room: ${orderId}`);
      }
    };
  }, [isTracking, socket, orderId]);

  const handleStopTracking = () => {
    setIsTracking(false);
    setStatus("Đã dừng");
  };

  const handleComplete = () => {
    setIsTracking(false);
    setStatus("Đã hoàn thành");
    setOrderId("");
    setConfirmCode("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-700 text-white">
      {/* Header */}
      <div className="bg-blue-900 px-4 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🚁</div>
            <div>
              <h1 className="text-xl font-bold">Drone Simulator</h1>
              <p className="text-sm text-blue-200">
                {isAuthenticated && droneInfo
                  ? `${droneInfo.model} - ${droneInfo.serialNumber}`
                  : "FastFood Delivery"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"
              }`}
            ></div>
            <span className="text-sm">
              {isConnected ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {!isAuthenticated ? (
          /* Authentication Form */
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-2xl font-bold text-center mb-4">
              🔐 Xác thực Drone
            </h2>
            <div>
              <label className="block text-sm text-blue-200 mb-2">
                Drone ID
              </label>
              <input
                type="text"
                value={droneId}
                onChange={(e) => setDroneId(e.target.value)}
                placeholder="Nhập Drone ID"
                className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur text-white placeholder-blue-200 border-2 border-white/30 focus:border-white focus:outline-none text-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-blue-200 mb-2">
                Serial Number
              </label>
              <input
                type="text"
                value={droneSerial}
                onChange={(e) => setDroneSerial(e.target.value)}
                placeholder="Nhập Serial Number"
                className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur text-white placeholder-blue-200 border-2 border-white/30 focus:border-white focus:outline-none text-lg"
              />
            </div>
            <button
              onClick={handleAuthenticateDrone}
              disabled={!isConnected}
              className="w-full py-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:opacity-50 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all"
            >
              🔓 Xác thực
            </button>
            <div className="bg-white/10 rounded-xl p-4 text-sm text-blue-100">
              <p className="font-semibold mb-2">📋 Hướng dẫn:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Lấy Drone ID từ trang quản lý drone</li>
                <li>Nhập Serial Number của drone</li>
                <li>Nhấn "Xác thực" để kết nối</li>
              </ol>
            </div>
          </div>
        ) : (
          <>
            {/* Authenticated View */}
            <div className="flex justify-between items-center">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl px-4 py-2">
                <p className="text-xs text-blue-200">Drone đang hoạt động</p>
                <p className="font-bold">{droneInfo?.model}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl font-bold active:scale-95 transition-all"
              >
                🚪 Đăng xuất
              </button>
            </div>

            {/* Status Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl">
          <div className="text-center">
            <p className="text-sm text-blue-200 mb-2">Trạng thái</p>
            <p className="text-2xl font-bold">{status}</p>
          </div>
        </div>

        {/* Battery and Location */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-xl">
            <p className="text-sm text-blue-200 mb-2">Pin</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/20 rounded-full h-3">
                <div
                  className={`h-full rounded-full transition-all ${
                    battery > 50
                      ? "bg-green-400"
                      : battery > 20
                      ? "bg-yellow-400"
                      : "bg-red-400"
                  }`}
                  style={{ width: `${battery}%` }}
                ></div>
              </div>
              <span className="text-lg font-bold">{battery}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={battery}
              onChange={(e) => setBattery(Number(e.target.value))}
              className="w-full mt-2"
            />
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-xl">
            <p className="text-sm text-blue-200 mb-2">GPS</p>
            <p className="text-xs font-mono truncate">
              {location.lat.toFixed(6)}
            </p>
            <p className="text-xs font-mono truncate">
              {location.lng.toFixed(6)}
            </p>
            {location.accuracy && (
              <p className="text-xs text-blue-200 mt-1">
                ±{Math.round(location.accuracy)}m
              </p>
            )}
          </div>
        </div>

        {/* Current Address */}
        {isTracking && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-xl">
            <p className="text-sm text-blue-200 mb-2">📍 Vị trí hiện tại</p>
            <p className="text-sm text-white break-words">{address}</p>
          </div>
        )}

        {/* Order Info */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <label className="block text-sm text-blue-200 mb-2">Order ID</label>
            <div className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur text-white border-2 border-white/30 text-lg text-center font-mono">
              {orderId || "Chờ nhận đơn hàng..."}
            </div>
          </div>

          {confirmCode && (
            <div>
              <label className="block text-sm text-blue-200 mb-2">
                Mã xác nhận giao hàng
              </label>
              <div className="bg-green-500/20 border-2 border-green-400 rounded-xl p-6 text-center">
                <p className="text-sm text-green-200 mb-2">
                  Đưa mã này cho khách hàng
                </p>
                <p className="text-4xl font-bold tracking-widest">
                  {confirmCode}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="space-y-3">
          {isTracking ? (
            <>
              <button
                onClick={handleStopTracking}
                className="w-full py-4 bg-yellow-500 hover:bg-yellow-600 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all"
              >
                ⏸️ Tạm dừng
              </button>
              <button
                onClick={handleComplete}
                className="w-full py-4 bg-red-500 hover:bg-red-600 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all"
              >
                ✅ Hoàn thành
              </button>
            </>
          ) : (
            <div className="bg-blue-400/20 border-2 border-blue-300 rounded-xl p-4 text-center">
              <p className="text-blue-100">
                {orderId 
                  ? "🚀 Đang chờ bắt đầu giao hàng..." 
                  : "⏳ Chờ owner gán đơn hàng..."}
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 text-sm text-blue-100">
          <p className="font-semibold mb-2">📱 Hướng dẫn:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Chờ owner gán đơn hàng cho drone của bạn</li>
            <li>Hệ thống tự động nhận Order ID và mã xác nhận</li>
            <li>Cho phép truy cập GPS khi được hỏi</li>
            <li>Vị trí của bạn sẽ được cập nhật real-time</li>
            <li>Đưa mã xác nhận cho khách hàng khi đến nơi</li>
            <li>Nhấn "Hoàn thành" khi giao xong</li>
          </ol>
        </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
