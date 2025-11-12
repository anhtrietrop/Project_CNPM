import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import { serverURL } from "../App";
import {
  FaUsers,
  FaStore,
  FaShoppingBag,
  FaTruck,
  FaDollarSign,
  FaHelicopter,
} from "react-icons/fa";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${serverURL}/api/admin/stats`, {
        withCredentials: true,
      });
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div
          className={`w-14 h-14 ${bgColor} rounded-lg flex items-center justify-center`}
        >
          <Icon className={`text-2xl ${color}`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Đang tải...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Tổng quan</h1>
        <p className="text-gray-600">
          Tổng quan hệ thống FastFood Drone Delivery
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <StatCard
          icon={FaUsers}
          label="Tổng người dùng"
          value={stats?.totalUsers || 0}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatCard
          icon={FaStore}
          label="Tổng nhà hàng"
          value={stats?.totalShops || 0}
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
        <StatCard
          icon={FaShoppingBag}
          label="Đơn hôm nay"
          value={stats?.todayOrders || 0}
          color="text-orange-600"
          bgColor="bg-orange-100"
        />
        <StatCard
          icon={FaDollarSign}
          label="Doanh thu hôm nay"
          value={`${stats?.todayRevenue || 0}K`}
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard
          icon={FaHelicopter}
          label="Drone nhàn rỗi"
          value={stats?.idleDrones || 0}
          color="text-indigo-600"
          bgColor="bg-indigo-100"
        />
        <StatCard
          icon={FaTruck}
          label="Drone đang bay"
          value={stats?.activeDrones || 0}
          color="text-pink-600"
          bgColor="bg-pink-100"
        />
      </div>

      {/* Pending Shops Alert */}
      {stats?.pendingShops > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-6">
          <div className="flex items-center">
            <FaStore className="text-yellow-600 text-xl mr-3" />
            <div>
              <p className="text-yellow-800 font-semibold">
                Có {stats.pendingShops} nhà hàng chờ duyệt
              </p>
              <p className="text-yellow-700 text-sm">
                Vui lòng kiểm tra và duyệt các nhà hàng mới
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Trạng thái Drone
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">IDLE</span>
              <span className="font-semibold text-gray-800">
                {stats?.idleDrones || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">DISPATCHING</span>
              <span className="font-semibold text-blue-600">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">EN_ROUTE</span>
              <span className="font-semibold text-purple-600">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">RETURNING</span>
              <span className="font-semibold text-yellow-600">1</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">INACTIVE</span>
              <span className="font-semibold text-red-600">0</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Doanh thu theo nhà hàng
          </h3>
          <div className="text-center text-gray-500 py-8">
            Biểu đồ trống (mock data)
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
