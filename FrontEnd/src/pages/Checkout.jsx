import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  FaMapMarkerAlt,
  FaUser,
  FaEnvelope,
  FaCreditCard,
  FaMoneyBillWave,
  FaCheck,
  FaSearch,
  FaLocationArrow,
} from "react-icons/fa";
import useCart from "../hooks/useCart";
import { useSelector } from "react-redux";
import axios from "axios";
import { serverURL } from "../App.jsx";
import { formatCurrency } from "../utils/formatCurrency.js";

// Fix marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Component để fly to location
function FlyToLocation({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 15, {
        duration: 1.5,
      });
    }
  }, [position, map]);

  return null;
}

// Component để handle click trên map
function LocationMarker({ position, setPosition, isConfirmed, onDragEnd }) {
  const markerRef = useRef(null);

  useMapEvents({
    click(e) {
      if (!isConfirmed) {
        setPosition(e.latlng);
        if (onDragEnd) {
          onDragEnd(e.latlng);
        }
      }
    },
  });

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setPosition(newPos);
          if (onDragEnd) {
            onDragEnd(newPos);
          }
        }
      },
    }),
    [setPosition, onDragEnd]
  );

  return position === null ? null : (
    <Marker
      position={position}
      draggable={!isConfirmed}
      eventHandlers={eventHandlers}
      ref={markerRef}
    >
      <Popup>
        {isConfirmed
          ? "✓ Địa chỉ đã xác nhận"
          : "Kéo marker để điều chỉnh vị trí"}
      </Popup>
    </Marker>
  );
}

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getTotalPrice, clearCart } = useCart();
  const currentUser = useSelector((state) => state.auth?.user);

  const [mapPosition, setMapPosition] = useState({
    lat: 10.8231,
    lng: 106.6297,
  });

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");

  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [isLocationConfirmed, setIsLocationConfirmed] = useState(false);
  const [tempAddress, setTempAddress] = useState("");
  const [tempCity, setTempCity] = useState("");

  // Load user info
  useEffect(() => {
    if (currentUser) {
      setContactName(currentUser.name || "");
      setContactPhone(currentUser.phone || "");
      setContactEmail(currentUser.email || "");
    }
  }, [currentUser]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  // Function để cập nhật vị trí hiện tại
  const updateCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMapPosition(newPosition);
          setIsLocationConfirmed(false);
          // Lấy địa chỉ từ tọa độ mới
          getAddressFromCoordinates(newPosition.lat, newPosition.lng);
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Không thể lấy vị trí hiện tại. Vui lòng thử lại!");
        }
      );
    } else {
      setError("Trình duyệt không hỗ trợ định vị!");
    }
  };

  // Geocoding - Tìm tọa độ từ địa chỉ
  const searchAddressLocation = async () => {
    if (!tempAddress) {
      setError("Vui lòng nhập địa chỉ!");
      return;
    }

    try {
      setSearchingAddress(true);
      setError(null);

      const searchQuery = tempCity
        ? `${tempAddress}, ${tempCity}`
        : tempAddress;

      // Thêm delay để tránh rate limit
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1`,
        {
          headers: {
            "User-Agent": "FoodDeliveryApp/1.0",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const location = data[0];
        setMapPosition({
          lat: parseFloat(location.lat),
          lng: parseFloat(location.lon),
        });
        setIsLocationConfirmed(false);
        setError(null);
      } else {
        setError("Không tìm thấy địa chỉ. Vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Error searching address:", error);
      setError("Lỗi khi tìm kiếm địa chỉ! Vui lòng thử lại sau.");
    } finally {
      setSearchingAddress(false);
    }
  };

  // Reverse geocoding - Lấy địa chỉ từ tọa độ
  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      // Thêm delay để tránh rate limit
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            "User-Agent": "FoodDeliveryApp/1.0",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.display_name) {
        setTempAddress(data.display_name);
        setTempCity(
          data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            ""
        );
      }
    } catch (error) {
      console.error("Error getting address:", error);
      // Không hiển thị lỗi cho user, chỉ log
      // User có thể tự nhập địa chỉ
    }
  };

  // Xác nhận vị trí trên map
  const confirmLocation = async () => {
    if (!mapPosition) {
      setError("Vui lòng chọn vị trí trên bản đồ!");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Chỉ gọi API khi xác nhận, không tự động
      if (!tempAddress) {
        await getAddressFromCoordinates(mapPosition.lat, mapPosition.lng);
      }

      setAddress(tempAddress);
      setCity(tempCity);
      setIsLocationConfirmed(true);
    } catch (err) {
      console.error("Confirm location error:", err);
      setError("Lỗi khi xác nhận vị trí!");
    } finally {
      setLoading(false);
    }
  };

  // REMOVE auto-fetch address - chỉ cho phép user tự nhập hoặc tìm kiếm
  // Update temp address when map position changes (only if not confirmed)
  // useEffect(() => {
  //   if (mapPosition && !isLocationConfirmed) {
  //     getAddressFromCoordinates(mapPosition.lat, mapPosition.lng);
  //   }
  // }, [mapPosition, isLocationConfirmed]);

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cart || cart.length === 0) {
      setError("Giỏ hàng trống!");
      return;
    }

    if (!isLocationConfirmed) {
      setError("Vui lòng xác nhận vị trí giao hàng trên bản đồ!");
      return;
    }

    if (!address || !city) {
      setError("Vui lòng xác nhận địa chỉ giao hàng!");
      return;
    }

    if (!contactName || !contactPhone) {
      setError("Vui lòng điền đầy đủ thông tin liên hệ!");
      return;
    }

    // Validate số điện thoại
    if (!/^[0-9]{10,11}$/.test(contactPhone)) {
      setError("Số điện thoại phải có 10-11 chữ số!");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // ✅ FLOW CŨ: Tạo order TRƯỚC
      const orderData = {
        items: cart.cartItems || cart.items,
        totalAmount: cart.totalAmount,
        deliveryAddress: {
          address,
          city,
          coordinates: mapPosition,
          note: notes,
        },
        contactInfo: {
          name: contactName,
          phone: contactPhone,
          email: contactEmail,
        },
      };

      console.log("1. Creating order first...", orderData);

      // Tạo order trước
      const orderResponse = await axios.post(
        `${serverURL}/api/order`,
        orderData,
        { withCredentials: true }
      );

      console.log("Order response:", orderResponse.data);

      if (!orderResponse.data.success) {
        console.error("Order creation failed:", orderResponse.data);
        throw new Error(orderResponse.data.message || "Không thể tạo đơn hàng");
      }

      const orderId = orderResponse.data.data._id;
      console.log("2. Order created:", orderId);

      // Sau đó tạo URL thanh toán VNPay với orderId
      const paymentResponse = await axios.post(
        `${serverURL}/api/payment/vnpay/create-payment-url`,
        {
          orderId: orderId, // Gửi orderId thay vì orderData
          amount: cart.totalAmount,
          bankCode: "", // Optional
        },
        { withCredentials: true }
      );

      console.log("3. Payment response:", paymentResponse.data);

      if (
        paymentResponse.data.success &&
        paymentResponse.data.data.paymentUrl
      ) {
        console.log(
          "4. Redirecting to VNPay:",
          paymentResponse.data.data.paymentUrl
        );
        // KHÔNG clear cart ở đây - chỉ clear khi thanh toán thành công

        // Chuyển hướng đến VNPay để thanh toán
        window.location.href = paymentResponse.data.data.paymentUrl;
      } else {
        console.error("Invalid payment response:", paymentResponse.data);
        setError("Không thể tạo link thanh toán!");
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      setError(
        error.response?.data?.message || "Có lỗi xảy ra khi thanh toán!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-[#3399df] hover:text-blue-600 transition-colors"
        >
          <IoMdArrowRoundBack size={24} />
          <span className="font-medium"></span>
        </button>
        <h2 className="text-2xl font-bold">Thanh toán</h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cart Items Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Sản phẩm trong giỏ hàng
          </h3>
          {(cart?.cartItems && cart.cartItems.length > 0) ||
          (cart?.items && cart.items.length > 0) ? (
            <div className="space-y-3">
              {(cart.cartItems || cart.items || []).map((cartItem) => (
                <div
                  key={cartItem.itemId}
                  className="flex items-center gap-4 p-3 border rounded-lg"
                >
                  <img
                    src={cartItem.itemImage}
                    alt={cartItem.itemName}
                    className="w-16 h-16 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/64x64?text=No+Image";
                    }}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">
                      {cartItem.itemName}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Số lượng: {cartItem.quantity}
                    </p>
                    <p className="text-sm text-gray-500">
                      Shop: {cartItem.shopName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-[#3399df]">
                      {formatCurrency(
                        cartItem.subtotal || cartItem.price * cartItem.quantity
                      )}
                    </p>
                  </div>
                </div>
              ))}
              <div className="border-t pt-3 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Tổng cộng:</span>
                  <span className="text-xl font-bold text-[#3399df]">
                    {formatCurrency(cart.totalAmount || 0)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Giỏ hàng trống</p>
          )}
        </div>

        {/* Map Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-lg font-medium text-gray-700">
              Chọn vị trí giao hàng trên bản đồ:
            </label>
            <button
              type="button"
              onClick={updateCurrentLocation}
              className="flex items-center gap-2 bg-[#3399df] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FaLocationArrow />
              Cập nhật vị trí
            </button>
          </div>
          <div
            style={{ height: "400px", width: "100%" }}
            className="rounded-lg overflow-hidden border border-gray-300 relative"
          >
            <MapContainer
              center={mapPosition}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FlyToLocation position={mapPosition} />
              <LocationMarker
                position={mapPosition}
                setPosition={setMapPosition}
                isConfirmed={isLocationConfirmed}
                onDragEnd={(newPos) => {
                  getAddressFromCoordinates(newPos.lat, newPos.lng);
                }}
              />
            </MapContainer>
          </div>
        </div>

        {/* Address Section */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h3 className="text-lg font-medium text-gray-700 mb-3">
            Địa chỉ giao hàng
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa chỉ
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={isLocationConfirmed ? address : tempAddress}
                onChange={(e) => {
                  if (isLocationConfirmed) {
                    setAddress(e.target.value);
                  } else {
                    setTempAddress(e.target.value);
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập địa chỉ của bạn"
                required
                disabled={isLocationConfirmed}
              />
              {!isLocationConfirmed && (
                <button
                  type="button"
                  onClick={searchAddressLocation}
                  disabled={searchingAddress}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <FaSearch />
                  {searchingAddress ? "..." : "Tìm"}
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thành phố
            </label>
            <input
              type="text"
              value={isLocationConfirmed ? city : tempCity}
              onChange={(e) => {
                if (isLocationConfirmed) {
                  setCity(e.target.value);
                } else {
                  setTempCity(e.target.value);
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isLocationConfirmed}
            />
          </div>

          {/* Confirm Location Button */}
          <div className="flex gap-2 pt-2">
            {!isLocationConfirmed ? (
              <button
                type="button"
                onClick={confirmLocation}
                disabled={loading}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <FaCheck />
                {loading ? "Đang xác nhận..." : "Xác nhận vị trí"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsLocationConfirmed(false);
                  setTempAddress(address);
                  setTempCity(city);
                }}
                className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <FaMapMarkerAlt />
                Thay đổi vị trí
              </button>
            )}
          </div>

          {/* Confirmation Message */}
          {isLocationConfirmed && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
              <FaCheck className="text-green-600" />
              <span>Vị trí đã được xác nhận!</span>
            </div>
          )}

          {/* Notes Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú (tùy chọn)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Ghi chú cho đơn hàng..."
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h3 className="text-lg font-medium text-gray-700 mb-3">
            Thông tin liên hệ
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaUser className="inline mr-2" />
              Tên người nhận
            </label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => {
                // Chỉ cho phép nhập số
                const value = e.target.value.replace(/[^0-9]/g, "");
                setContactPhone(value);
              }}
              pattern="[0-9]{10,11}"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập 10-11 chữ số"
              required
            />
            {contactPhone && !/^[0-9]{10,11}$/.test(contactPhone) && (
              <p className="text-red-500 text-sm mt-1">
                Số điện thoại phải có 10-11 chữ số
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaEnvelope className="inline mr-2" />
              Email
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Payment Method - VNPay Only */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h3 className="text-lg font-medium text-gray-700 mb-3">
            Phương thức thanh toán
          </h3>

          <div className="flex items-center space-x-3 p-4 border-2 border-[#3399df] rounded-lg bg-blue-50">
            <img
              src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png"
              alt="VNPay"
              className="h-8"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-800">Thanh toán qua VNPay</p>
              <p className="text-sm text-gray-600">
                Hỗ trợ thanh toán qua ATM, Visa, MasterCard, JCB, QR Code
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isLocationConfirmed || loading}
          className="w-full bg-[#3399df] text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Đang xử lý...</span>
            </>
          ) : (
            <>
              <FaCreditCard />
              <span>Thanh toán qua VNPay</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default Checkout;
