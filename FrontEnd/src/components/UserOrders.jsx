import React, { useState } from "react";
import useGetUserOrders from "../hooks/useGetUserOrders.jsx";
import axios from "axios";
import { serverURL } from "../App.jsx";
import {
  FaShoppingBag,
  FaClock,
  FaTruck,
  FaTimesCircle,
  FaUtensils,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaBox,
} from "react-icons/fa";
import { IoIosNotifications } from "react-icons/io";
import Loading from "./Loading.jsx";
import { formatCurrency } from "../utils/formatCurrency.js";
import { useToast } from "../hooks/useToast.jsx";
import DroneTrackingMap from "./DroneTrackingMap.jsx";

const UserOrders = () => {
  const [selectedStatus, setSelectedStatus] = useState("");
  const { orders, loading, error, refetchOrders } =
    useGetUserOrders(selectedStatus);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [showConfirmCodeModal, setShowConfirmCodeModal] = useState(false);
  const [confirmCode, setConfirmCode] = useState("");
  const [verifyingCode, setVerifyingCode] = useState(false);
  const toast = useToast();

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

  const handleCancelOrder = async (orderId) => {
    setSelectedOrderId(orderId);
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async () => {
    try {
      setCancellingOrderId(selectedOrderId);

      await axios.put(
        `${serverURL}/api/order/${selectedOrderId}/cancel`,
        { reason: cancelReason || "Cancelled by customer" },
        { withCredentials: true }
      );

      toast.success("Hủy đơn hàng thành công!");
      setShowCancelModal(false);
      setCancelReason("");
      refetchOrders();
    } catch (err) {
      console.error("Error cancelling order:", err);
      toast.error(err.response?.data?.message || "Lỗi khi hủy đơn hàng!");
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handleOpenConfirmCodeModal = (orderId) => {
    setSelectedOrderId(orderId);
    setConfirmCode("");
    setShowConfirmCodeModal(true);
  };

  const handleVerifyConfirmCode = async () => {
    if (!confirmCode || confirmCode.length !== 6) {
      toast.error("Vui lòng nhập mã xác nhận 6 chữ số");
      return;
    }

    setVerifyingCode(true);
    try {
      await axios.post(
        `${serverURL}/api/order/${selectedOrderId}/verify-code`,
        { confirmCode },
        { withCredentials: true }
      );

      toast.success("Xác nhận giao hàng thành công! Cảm ơn bạn đã đặt hàng!");
      setShowConfirmCodeModal(false);
      setConfirmCode("");
      refetchOrders();
    } catch (err) {
      console.error("Error verifying code:", err);
      toast.error(err.response?.data?.message || "Mã xác nhận không đúng!");
    } finally {
      setVerifyingCode(false);
    }
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
          Đơn hàng của tôi
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
              : "Bạn chưa có đơn hàng nào"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Order Header */}
              <div className="bg-gradient-to-r from-[#3399df] to-blue-500 text-white px-6 py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm opacity-90">Mã đơn hàng</p>
                    <p className="font-bold text-lg">#{order._id.slice(-8)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm opacity-90">Ngày đặt</p>
                    <p className="font-medium">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Order Body */}
              <div className="p-6">
                {/* Status */}
                <div className="mb-4 flex items-center justify-between">
                  <span
                    className={`px-4 py-2 rounded-full font-medium border-2 flex items-center gap-2 ${getStatusColor(
                      order.orderStatus
                    )}`}
                  >
                    {getStatusLabel(order.orderStatus)}
                  </span>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#3399df]">
                      {formatCurrency(order.totalAmount)}
                    </p>
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

                {/* Drone Tracking Map - Show when order is delivering */}
                {order.orderStatus === "delivering" && order.drone && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <FaTruck className="text-purple-600" />
                      Theo dõi vị trí Drone
                    </h4>
                    <DroneTrackingMap
                      orderId={order._id}
                      deliveryAddress={order.deliveryAddress}
                      shopCoordinates={order.orderItems[0]?.shopId?.coordinates}
                    />
                    {order.deliveryDistance && (
                      <div className="mt-2 bg-purple-50 p-3 rounded-lg">
                        <p className="text-sm text-purple-700">
                          <span className="font-semibold">Khoảng cách giao hàng:</span>{" "}
                          {order.deliveryDistance.toFixed(2)} km
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Order Items */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <FaBox className="text-[#3399df]" />
                    Sản phẩm đã đặt
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
                            {item.shopName}
                          </p>
                          <p className="text-sm text-gray-500">
                            SL: {item.quantity} x {formatCurrency(item.price)}
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

                {/* Action Buttons */}
                {/* Cancel Button - Only show for pending orders */}
                {order.orderStatus === "pending" && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      disabled={cancellingOrderId === order._id}
                      className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <FaTimesCircle />
                      {cancellingOrderId === order._id
                        ? "Đang hủy..."
                        : "Hủy đơn hàng"}
                    </button>
                  </div>
                )}

                {/* Confirm Delivery Button - Only show for delivering orders */}
                {order.orderStatus === "delivering" && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleOpenConfirmCodeModal(order._id)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <FaCheckCircle />
                      Xác nhận đã nhận hàng
                    </button>
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
            </div>
          ))}
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Hủy đơn hàng
            </h3>
            <p className="text-gray-600 mb-4">
              Bạn có chắc muốn hủy đơn hàng này không?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do hủy đơn (tùy chọn):
              </label>
              <input
                type="text"
                placeholder="Nhập lý do hủy..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3399df]"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={confirmCancelOrder}
                disabled={cancellingOrderId}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {cancellingOrderId ? "Đang hủy..." : "Xác nhận hủy"}
              </button>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                disabled={cancellingOrderId}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Code Modal */}
      {showConfirmCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaCheckCircle className="text-green-500" />
              Xác nhận đã nhận hàng
            </h3>
            <p className="text-gray-600 mb-4">
              Vui lòng nhập mã xác nhận 6 chữ số mà người giao hàng cung cấp:
            </p>
            <div className="mb-6">
              <input
                type="text"
                placeholder="Nhập mã 6 chữ số"
                value={confirmCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setConfirmCode(value);
                }}
                maxLength={6}
                className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                Mã xác nhận được hiển thị trên thiết bị của người giao hàng
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleVerifyConfirmCode}
                disabled={verifyingCode || confirmCode.length !== 6}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifyingCode ? "Đang xác nhận..." : "Xác nhận"}
              </button>
              <button
                onClick={() => {
                  setShowConfirmCodeModal(false);
                  setConfirmCode("");
                }}
                disabled={verifyingCode}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrders;
