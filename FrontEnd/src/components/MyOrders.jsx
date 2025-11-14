import React, { useState } from "react";
import useGetShopOrders from "../hooks/useGetShopOrders.jsx";
import axios from "axios";
import { serverURL } from "../App.jsx";
import { useToast } from "../hooks/useToast";
import {
  FaShoppingBag,
  FaCheckCircle,
  FaClock,
  FaTruck,
  FaTimesCircle,
  FaUtensils,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaBatteryFull,
  FaBatteryHalf,
  FaBatteryQuarter,
  FaEdit,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import Loading from "./Loading.jsx";
import { formatCurrency } from "../utils/formatCurrency.js";
import DroneTrackingMap from "./DroneTrackingMap.jsx";

const MyOrders = () => {
  const toast = useToast();
  const [selectedStatus, setSelectedStatus] = useState("");
  const { orders, loading, error, refetchOrders } =
    useGetShopOrders(selectedStatus);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [showDroneModal, setShowDroneModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [availableDrones, setAvailableDrones] = useState([]);
  const [loadingDrones, setLoadingDrones] = useState(false);
  const [selectedDrone, setSelectedDrone] = useState(null);
  const [showBatteryModal, setShowBatteryModal] = useState(false);
  const [batteryPercentage, setBatteryPercentage] = useState(100);
  const [selectedOrderForBattery, setSelectedOrderForBattery] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  const statusOptions = [
    { value: "", label: "Tất cả", icon: FaShoppingBag, color: "gray" },
    { value: "pending", label: "Chờ xác nhận", icon: FaClock, color: "yellow" },
    {
      value: "confirmed",
      label: "Đã xác nhận",
      icon: FaCheckCircle,
      color: "blue",
    },
    {
      value: "preparing",
      label: "Đang chuẩn bị",
      icon: FaUtensils,
      color: "orange",
    },
    { value: "delivering", label: "Đang giao", icon: FaTruck, color: "purple" },
    {
      value: "completed",
      label: "Hoàn thành",
      icon: FaCheckCircle,
      color: "green",
    },
    { value: "cancelled", label: "Đã hủy", icon: FaTimesCircle, color: "red" },
  ];

  const getStatusColor = (status) => {
    const statusMap = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      confirmed: "bg-blue-100 text-blue-800 border-blue-300",
      preparing: "bg-orange-100 text-orange-800 border-orange-300",
      delivering: "bg-purple-100 text-purple-800 border-purple-300",
      completed: "bg-green-100 text-green-800 border-green-300",
      cancelled: "bg-red-100 text-red-800 border-red-300",
    };
    return statusMap[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getStatusLabel = (status) => {
    const option = statusOptions.find((opt) => opt.value === status);
    return option ? option.label : status;
  };

  const getNextStatuses = (currentStatus) => {
    const statusFlow = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["preparing", "cancelled"],
      preparing: ["delivering", "cancelled"],
      delivering: ["completed", "cancelled"],
      completed: [],
      cancelled: [],
    };
    return statusFlow[currentStatus] || [];
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    // Nếu chuyển sang delivering, hiển thị modal chọn drone
    if (newStatus === "delivering") {
      await fetchAvailableDrones(orderId);
      setSelectedOrder(orderId);
      setShowDroneModal(true);
      return;
    }

    try {
      setUpdatingOrderId(orderId);

      await axios.put(
        `${serverURL}/api/order/shop/${orderId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );

      toast.success("Cập nhật trạng thái đơn hàng thành công!");

      // Refetch orders để cập nhật UI
      await refetchOrders();
    } catch (err) {
      console.error("Error updating order status:", err);
      toast.error(
        err.response?.data?.message || "Lỗi khi cập nhật trạng thái đơn hàng!"
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const fetchAvailableDrones = async (orderId) => {
    try {
      setLoadingDrones(true);
      const response = await axios.get(
        `${serverURL}/api/order/shop/${orderId}/available-drones`,
        { withCredentials: true }
      );
      setAvailableDrones(response.data.drones || []);
    } catch (err) {
      console.error("Error fetching drones:", err);
      toast.error("Không thể tải danh sách drone!");
    } finally {
      setLoadingDrones(false);
    }
  };

  const handleAssignDrone = async () => {
    if (!selectedDrone) {
      toast.error("Vui lòng chọn drone!");
      return;
    }

    try {
      setUpdatingOrderId(selectedOrder);

      await axios.post(
        `${serverURL}/api/order/shop/${selectedOrder}/assign-drone`,
        { droneId: selectedDrone },
        { withCredentials: true }
      );

      toast.success("Giao drone thành công! Đơn hàng đang được giao.");
      setShowDroneModal(false);
      setSelectedOrder(null);
      setSelectedDrone(null);
      refetchOrders();
    } catch (err) {
      console.error("Error assigning drone:", err);
      toast.error(err.response?.data?.message || "Lỗi khi giao drone!");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleOpenBatteryModal = (order) => {
    setSelectedOrderForBattery(order);
    setBatteryPercentage(order.droneBatteryPercentage || 100);
    setShowBatteryModal(true);
  };

  const handleUpdateBattery = async () => {
    if (!selectedOrderForBattery) return;

    if (batteryPercentage < 0 || batteryPercentage > 100) {
      toast.error("Phần trăm pin phải từ 0 đến 100!");
      return;
    }

    try {
      setUpdatingOrderId(selectedOrderForBattery._id);

      await axios.put(
        `${serverURL}/api/order/shop/${selectedOrderForBattery._id}/drone-battery`,
        { batteryPercentage: Number(batteryPercentage) },
        { withCredentials: true }
      );

      toast.success("Cập nhật pin drone thành công!");
      setShowBatteryModal(false);
      setSelectedOrderForBattery(null);

      // Refetch orders để cập nhật UI
      await refetchOrders();
    } catch (err) {
      console.error("Error updating drone battery:", err);
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật pin drone!");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getBatteryIcon = (battery) => {
    if (battery >= 70) return <FaBatteryFull className="text-green-600" />;
    if (battery >= 30) return <FaBatteryHalf className="text-yellow-600" />;
    return <FaBatteryQuarter className="text-red-600" />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaShoppingBag className="text-[#3399df]" />
          Quản lý đơn hàng
        </h2>

        {/* Filter */}
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setSelectedStatus(option.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  selectedStatus === option.value
                    ? "bg-[#3399df] text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Icon />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <FaShoppingBag className="text-gray-300 w-16 h-16 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {selectedStatus
              ? `Không có đơn hàng ${getStatusLabel(
                  selectedStatus
                ).toLowerCase()}`
              : "Chưa có đơn hàng nào"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrders.has(order._id);
            return (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Order Header - Clickable */}
                <div
                  className="bg-gradient-to-r from-[#3399df] to-blue-500 text-white px-6 py-4 cursor-pointer hover:from-blue-500 hover:to-[#3399df] transition-all"
                  onClick={() => toggleOrderExpansion(order._id)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm opacity-90">Mã đơn hàng</p>
                        <p className="font-bold text-lg">
                          #{order._id.slice(-8)}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border-2 bg-white ${
                          order.orderStatus === "pending"
                            ? "text-yellow-700 border-yellow-300"
                            : order.orderStatus === "confirmed"
                            ? "text-blue-700 border-blue-300"
                            : order.orderStatus === "preparing"
                            ? "text-orange-700 border-orange-300"
                            : order.orderStatus === "delivering"
                            ? "text-purple-700 border-purple-300"
                            : order.orderStatus === "completed"
                            ? "text-green-700 border-green-300"
                            : "text-red-700 border-red-300"
                        }`}
                      >
                        {getStatusLabel(order.orderStatus)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm opacity-90">Tổng tiền</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(order.totalAmount)}
                        </p>
                      </div>
                      {isExpanded ? (
                        <FaChevronUp className="text-2xl" />
                      ) : (
                        <FaChevronDown className="text-2xl" />
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-sm opacity-90">
                    <p>Ngày đặt: {formatDate(order.createdAt)}</p>
                  </div>
                </div>

                {/* Order Body - Expandable */}
                {isExpanded && (
                  <div className="p-6 border-t-2 border-blue-100">
                    {/* Customer Info */}
                    <div className="mb-4 bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Thông tin khách hàng
                      </h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <FaEnvelope className="text-gray-400" />
                          <span className="font-medium">Tên:</span>{" "}
                          {order.contactInfo.name}
                        </p>
                        <p className="flex items-center gap-2">
                          <FaPhone className="text-gray-400" />
                          <span className="font-medium">SĐT:</span>{" "}
                          {order.contactInfo.phone}
                        </p>
                        {order.contactInfo.email && (
                          <p className="flex items-center gap-2">
                            <FaEnvelope className="text-gray-400" />
                            <span className="font-medium">Email:</span>{" "}
                            {order.contactInfo.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="mb-4 bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-[#3399df]" />
                        Địa chỉ giao hàng
                      </h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{order.deliveryAddress.address}</p>
                        <p>{order.deliveryAddress.city}</p>
                        {order.deliveryAddress.note && (
                          <p className="italic text-gray-500">
                            Ghi chú: {order.deliveryAddress.note}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Drone Battery Info - Hiển thị khi đang delivering */}
                    {order.orderStatus === "delivering" && order.drone && (
                      <>
                        {/* Drone Tracking Map */}
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <FaTruck className="text-blue-600" />
                            Theo dõi vị trí Drone
                          </h4>
                          <DroneTrackingMap
                            orderId={order._id}
                            deliveryAddress={order.deliveryAddress}
                            shopCoordinates={order.orderItems[0]?.shopId?.coordinates}
                          />
                        </div>

                        {/* Battery Info */}
                        <div className="mb-4 bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">
                                {getBatteryIcon(
                                  order.droneBatteryPercentage || 100
                                )}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-800">
                                  Pin Drone
                                </h4>
                                <p
                                  className={`text-lg font-bold ${
                                    order.droneBatteryPercentage >= 70
                                      ? "text-green-600"
                                      : order.droneBatteryPercentage >= 30
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {order.droneBatteryPercentage || 100}%
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleOpenBatteryModal(order)}
                              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                            >
                              <FaEdit />
                              Cập nhật Pin
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Order Items - Chỉ hiển thị items của shop này */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Sản phẩm
                      </h4>
                      <div className="space-y-2">
                        {order.orderItems.map((item) => (
                          <div
                            key={item.orderItemId}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <img
                              src={item.itemImage}
                              alt={item.itemName}
                              className="w-16 h-16 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/64x64?text=No+Image";
                              }}
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">
                                {item.itemName}
                              </p>
                              <p className="text-sm text-gray-500">
                                SL: {item.quantity} x{" "}
                                {formatCurrency(item.price)}
                              </p>
                              {item.note && (
                                <p className="text-sm text-gray-500 italic">
                                  Ghi chú: {item.note}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-[#3399df]">
                                {formatCurrency(item.subtotal)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status Update Buttons */}
                    {getNextStatuses(order.orderStatus).length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600 mb-2">
                          Cập nhật trạng thái:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {getNextStatuses(order.orderStatus).map((status) => (
                            <button
                              key={status}
                              onClick={() =>
                                handleUpdateStatus(order._id, status)
                              }
                              disabled={updatingOrderId === order._id}
                              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                status === "cancelled"
                                  ? "bg-red-500 hover:bg-red-600 text-white"
                                  : "bg-[#3399df] hover:bg-blue-600 text-white"
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {updatingOrderId === order._id
                                ? "Đang cập nhật..."
                                : getStatusLabel(status)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Payment Info */}
                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center text-sm">
                      <div>
                        <span className="text-gray-600">
                          Phương thức thanh toán:{" "}
                        </span>
                        <span className="font-medium text-gray-800">
                          {order.payment?.paymentMethod === "vnpay" ? "VNPay" : "Tiền mặt"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">
                          Trạng thái thanh toán:{" "}
                        </span>
                        <span
                          className={`font-medium ${
                            order.payment?.status === "success"
                              ? "text-green-600"
                              : order.payment?.status === "failed"
                              ? "text-red-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {order.payment?.status === "success"
                            ? "Đã thanh toán"
                            : order.payment?.status === "failed"
                            ? "Thất bại"
                            : "Chờ thanh toán"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Drone Selection Modal */}
      {showDroneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaTruck className="text-[#3399df]" />
                Chọn Drone để giao hàng
              </h3>

              {loadingDrones ? (
                <Loading />
              ) : availableDrones.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    Không có drone nào khả dụng
                  </p>
                  <button
                    onClick={() => setShowDroneModal(false)}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Đóng
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    {availableDrones.map((drone) => (
                      <div
                        key={drone._id}
                        onClick={() => setSelectedDrone(drone._id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedDrone === drone._id
                            ? "border-[#3399df] bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 text-lg">
                              {drone.model}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Serial: {drone.serialNumber}
                            </p>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-600">Pin:</span>{" "}
                                <span
                                  className={`font-medium ${
                                    drone.battery.current >= 70
                                      ? "text-green-600"
                                      : drone.battery.current >= 30
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {drone.battery.current}%
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Tốc độ:</span>{" "}
                                <span className="font-medium text-gray-800">
                                  {drone.specifications.maxSpeed} km/h
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Tầm bay:</span>{" "}
                                <span className="font-medium text-gray-800">
                                  {drone.specifications.range} km
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  Thời gian bay:
                                </span>{" "}
                                <span className="font-medium text-gray-800">
                                  {drone.specifications.flightTime} phút
                                </span>
                              </div>
                            </div>
                          </div>
                          {selectedDrone === drone._id && (
                            <div className="ml-4">
                              <FaCheckCircle className="text-[#3399df] w-6 h-6" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowDroneModal(false);
                        setSelectedDrone(null);
                      }}
                      className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-medium"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleAssignDrone}
                      disabled={!selectedDrone || updatingOrderId}
                      className="flex-1 bg-[#3399df] text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingOrderId ? "Đang xử lý..." : "Xác nhận giao hàng"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Battery Update Modal */}
      {showBatteryModal && selectedOrderForBattery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                {getBatteryIcon(batteryPercentage)}
                Cập nhật Pin Drone
              </h3>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">
                  Đơn hàng:{" "}
                  <span className="font-semibold">
                    #{selectedOrderForBattery._id.slice(-8)}
                  </span>
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Pin hiện tại:{" "}
                  <span className="font-semibold text-purple-600">
                    {selectedOrderForBattery.droneBatteryPercentage || 100}%
                  </span>
                </p>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phần trăm pin mới (0-100%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={batteryPercentage}
                  onChange={(e) => setBatteryPercentage(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-lg font-semibold text-center"
                  placeholder="Nhập % pin"
                />

                {/* Visual Battery Indicator */}
                <div className="mt-4 bg-gray-200 h-8 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full transition-all duration-300 ${
                      batteryPercentage >= 70
                        ? "bg-green-500"
                        : batteryPercentage >= 30
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        Math.max(batteryPercentage, 0),
                        100
                      )}%`,
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-700">
                    {batteryPercentage}%
                  </div>
                </div>

                {/* Warning Messages */}
                {batteryPercentage < 20 && (
                  <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                    ⚠️ Cảnh báo: Pin thấp! Cần sạc hoặc thay drone
                  </div>
                )}
                {batteryPercentage >= 20 && batteryPercentage < 30 && (
                  <div className="mt-3 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-2 rounded-lg text-sm">
                    ⚠️ Lưu ý: Pin đang ở mức thấp
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowBatteryModal(false);
                    setSelectedOrderForBattery(null);
                  }}
                  disabled={updatingOrderId}
                  className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-medium disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdateBattery}
                  disabled={
                    updatingOrderId ||
                    batteryPercentage < 0 ||
                    batteryPercentage > 100
                  }
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingOrderId ? "Đang cập nhật..." : "Xác nhận"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
