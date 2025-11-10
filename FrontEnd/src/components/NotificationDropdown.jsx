import React, { useState, useEffect, useRef } from "react";
import { IoIosNotifications } from "react-icons/io";
import {
  FaCheckCircle,
  FaTruck,
  FaUtensils,
  FaClock,
  FaTimesCircle,
} from "react-icons/fa";
import useGetUserOrders from "../hooks/useGetUserOrders";

const NotificationDropdown = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [readNotifications, setReadNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const { orders } = useGetUserOrders("");

  // Load read notifications from localStorage
  useEffect(() => {
    const read = JSON.parse(localStorage.getItem("readNotifications") || "[]");
    setReadNotifications(read);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Generate notifications from orders
  const getNotifications = () => {
    if (!orders || orders.length === 0) return [];

    const notifications = [];

    orders.forEach((order) => {
      const notificationId = `${order._id}-${order.orderStatus}`;

      let notification = {
        id: notificationId,
        orderId: order._id,
        orderNumber: order._id.slice(-8),
        status: order.orderStatus,
        timestamp: order.updatedAt || order.createdAt,
        isRead: readNotifications.includes(notificationId),
      };

      switch (order.orderStatus) {
        case "confirmed":
          notification.icon = <FaCheckCircle className="text-blue-500" />;
          notification.title = "Đơn hàng đã được xác nhận";
          notification.message = `Đơn hàng #${notification.orderNumber} đã được shop xác nhận`;
          notification.color = "bg-blue-50 border-blue-200";
          break;
        case "preparing":
          notification.icon = <FaUtensils className="text-orange-500" />;
          notification.title = "Đang chuẩn bị đơn hàng";
          notification.message = `Đơn hàng #${notification.orderNumber} đang được chuẩn bị`;
          notification.color = "bg-orange-50 border-orange-200";
          break;
        case "delivering":
          notification.icon = <FaTruck className="text-purple-500" />;
          notification.title = "Đơn hàng đang được giao";
          notification.message = `Đơn hàng #${notification.orderNumber} đang trên đường giao đến bạn`;
          notification.color = "bg-purple-50 border-purple-200";
          break;
        case "completed":
          notification.icon = <FaCheckCircle className="text-green-500" />;
          notification.title = "Đơn hàng hoàn thành";
          notification.message = `Đơn hàng #${notification.orderNumber} đã được giao thành công`;
          notification.color = "bg-green-50 border-green-200";
          break;
        case "cancelled":
          notification.icon = <FaTimesCircle className="text-red-500" />;
          notification.title = "Đơn hàng đã bị hủy";
          notification.message = `Đơn hàng #${notification.orderNumber} đã bị hủy`;
          notification.color = "bg-red-50 border-red-200";
          break;
        default:
          return; // Don't show notification for pending orders
      }

      notifications.push(notification);
    });

    // Sort by timestamp, newest first
    return notifications.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
  };

  const notifications = getNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadNotifications(allIds);
    localStorage.setItem("readNotifications", JSON.stringify(allIds));
  };

  const clearAllNotifications = () => {
    if (window.confirm("Bạn có chắc muốn xóa tất cả thông báo?")) {
      const allIds = notifications.map((n) => n.id);
      setReadNotifications(allIds);
      localStorage.setItem("readNotifications", JSON.stringify(allIds));
      setShowDropdown(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds

    if (diff < 60) return "Vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;

    return date.toLocaleDateString("vi-VN");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Icon */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <IoIosNotifications className="text-3xl text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-[#3399df] to-blue-500 text-white rounded-t-lg">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <IoIosNotifications className="text-2xl" />
              Thông báo đơn hàng
            </h3>
            {unreadCount > 0 && (
              <p className="text-sm opacity-90 mt-1">
                Bạn có {unreadCount} thông báo chưa đọc
              </p>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FaClock className="mx-auto text-4xl mb-2 text-gray-300" />
                <p>Chưa có thông báo nào</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notif.isRead ? "bg-blue-50/50" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 text-2xl mt-1">
                        {notif.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-gray-800 text-sm">
                            {notif.title}
                          </p>
                          {!notif.isRead && (
                            <span className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-1"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(notif.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 flex gap-2 bg-gray-50 rounded-b-lg">
              <button
                onClick={markAllAsRead}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                Đã xem hết
              </button>
              <button
                onClick={clearAllNotifications}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                Xóa hết
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
