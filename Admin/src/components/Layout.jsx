import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutAdmin } from "../redux/adminSlice";
import {
  FaTachometerAlt,
  FaUsers,
  FaStore,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChartLine,
} from "react-icons/fa";

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { adminData } = useSelector((state) => state.admin);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { path: "/", icon: FaTachometerAlt, label: "Tổng quan" },
    { path: "/users", icon: FaUsers, label: "Người dùng" },
    { path: "/shops", icon: FaStore, label: "Nhà hàng" },
    { path: "/reports", icon: FaChartLine, label: "Báo cáo" },
  ];

  const handleLogout = () => {
    dispatch(logoutAdmin());
    navigate("/signin");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white shadow-lg transition-all duration-300 flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#3399df] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">🚁</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">
                  FastFood Drone
                </h1>
                <p className="text-xs text-gray-500">Quản trị</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  isActive
                    ? "bg-[#3399df] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Admin Info */}
        <div className="p-4 border-t">
          <div
            className={`flex items-center ${
              sidebarOpen ? "gap-3" : "justify-center"
            }`}
          >
            <div className="w-10 h-10 bg-[#3399df] rounded-full flex items-center justify-center text-white font-bold">
              {adminData?.fullName?.charAt(0) || "A"}
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="font-semibold text-gray-800 text-sm">
                  {adminData?.fullName || "Admin"}
                </p>
                <p className="text-xs text-gray-500">
                  {adminData?.email || ""}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 justify-center mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <FaSignOutAlt />
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
