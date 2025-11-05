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

const UserOrders = () => {
  const [selectedStatus, setSelectedStatus] = useState("");
  const { orders, loading, error, refetchOrders } =
    useGetUserOrders(selectedStatus);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

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
    if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này?")) {
      return;
    }

    const reason = window.prompt("Lý do hủy đơn (tùy chọn):");

    try {
      setCancellingOrderId(orderId);

      await axios.put(
        `${serverURL}/api/order/${orderId}/cancel`,
        { reason: reason || "Cancelled by customer" },
        { withCredentials: true }
      );

      alert("Hủy đơn hàng thành công!");
      refetchOrders();
    } catch (err) {
      console.error("Error cancelling order:", err);
      alert(err.response?.data?.message || "Lỗi khi hủy đơn hàng!");
    } finally {
      setCancellingOrderId(null);
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

                {/* Payment Info */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center text-sm">
                  <div>
                    <span className="text-gray-600">
                      Phương thức thanh toán:{" "}
                    </span>
                    <span className="font-medium text-gray-800">
                      {order.paymentMethod === "cash"
                        ? "Tiền mặt"
                        : "Thẻ tín dụng"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">
                      Trạng thái thanh toán:{" "}
                    </span>
                    <span
                      className={`font-medium ${
                        order.paymentStatus === "paid"
                          ? "text-green-600"
                          : order.paymentStatus === "failed"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {order.paymentStatus === "paid"
                        ? "Đã thanh toán"
                        : order.paymentStatus === "failed"
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
    </div>
  );
};

export default UserOrders;
