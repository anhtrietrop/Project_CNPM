import React, { useState, useEffect, useRef } from "react";
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
function LocationMarker({ position, setPosition, isConfirmed }) {
  useMapEvents({
    click(e) {
      if (!isConfirmed) {
        setPosition(e.latlng);
      }
    },
  });

  return position === null ? null : (
    <Marker position={position} draggable={!isConfirmed}>
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

  const [paymentMethod, setPaymentMethod] = useState("cash");

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
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1`
      );
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
      setError("Lỗi khi tìm kiếm địa chỉ!");
    } finally {
      setSearchingAddress(false);
    }
  };

  // Reverse geocoding - Lấy địa chỉ từ tọa độ
  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
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
      await getAddressFromCoordinates(mapPosition.lat, mapPosition.lng);
      setAddress(tempAddress);
      setCity(tempCity);
      setIsLocationConfirmed(true);
      setError(null);
    } catch (error) {
      setError("Lỗi khi xác nhận vị trí!");
    } finally {
      setLoading(false);
    }
  };

  // Update temp address when map position changes (only if not confirmed)
  useEffect(() => {
    if (mapPosition && !isLocationConfirmed) {
      getAddressFromCoordinates(mapPosition.lat, mapPosition.lng);
    }
  }, [mapPosition, isLocationConfirmed]);

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

    try {
      setLoading(true);
      setError(null);

      const orderData = {
        userId: currentUser?.id || null,
        items: cart,
        shippingAddress: {
          address,
          city,
          coordinates: mapPosition,
        },
        contact: {
          name: contactName,
          phone: contactPhone,
          email: contactEmail,
        },
        paymentMethod,
        notes,
        totalPrice: getTotalPrice(),
      };

      const response = await axios.post("/api/orders", orderData);

      if (response.data) {
        alert("Đặt hàng thành công!");
        clearCart();
        navigate("/orders");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      setError(error.response?.data?.message || "Có lỗi xảy ra khi đặt hàng!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/')}
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
          {cart?.items && cart.items.length > 0 ? (
            <div className="space-y-3">
              {cart.items.map((cartItem) => (
                <div
                  key={cartItem.item._id}
                  className="flex items-center gap-4 p-3 border rounded-lg"
                >
                  <img
                    src={cartItem.item.image}
                    alt={cartItem.item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/64x64?text=No+Image";
                    }}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">
                      {cartItem.item.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Số lượng: {cartItem.quantity}
                    </p>
                    <p className="text-sm text-gray-500">
                      Shop: {cartItem.item.shop?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-[#3399df]">
                      ${(cartItem.item.price * cartItem.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
              <div className="border-t pt-3 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Tổng cộng:</span>
                  <span className="text-xl font-bold text-[#3399df]">
                    ${cart.totalAmount?.toFixed(2) || "0.00"}
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
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
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

        {/* Payment Method */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h3 className="text-lg font-medium text-gray-700 mb-3">
            Phương thức thanh toán
          </h3>

          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                value="cash"
                checked={paymentMethod === "cash"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4 text-blue-500"
              />
              <FaMoneyBillWave className="text-green-600" />
              <span>Tiền mặt</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                value="card"
                checked={paymentMethod === "card"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4 text-blue-500"
              />
              <FaCreditCard className="text-blue-600" />
              <span>Thẻ tín dụng</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isLocationConfirmed || loading}
          className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Đang xử lý..." : "Đặt hàng"}
        </button>
      </form>
    </div>
  );
};

export default Checkout;
