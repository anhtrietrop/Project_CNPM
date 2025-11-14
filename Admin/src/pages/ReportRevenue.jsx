import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import { serverURL } from "../App";
import {
  FaChartLine,
  FaStore,
  FaMoneyBillWave,
  FaShoppingCart,
  FaCalendarAlt,
} from "react-icons/fa";
import { useToast } from "../hooks/useToast";

const ReportRevenue = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("day");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const toast = useToast();

  useEffect(() => {
    // Set default dates (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    setEndDate(today.toISOString().split("T")[0]);
    setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchRevenueData();
    }
  }, [period, startDate, endDate]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${serverURL}/api/report/revenue/restaurants`,
        {
          params: { period, startDate, endDate },
          withCredentials: true,
        }
      );
      setRevenueData(response.data.data);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      toast.error("Lỗi khi tải dữ liệu doanh thu");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getTotalRevenue = () => {
    return revenueData.reduce((sum, item) => sum + item.totalRevenue, 0);
  };

  const getTotalOrders = () => {
    return revenueData.reduce((sum, item) => sum + item.totalOrders, 0);
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <FaChartLine className="text-[#3399df]" />
          Báo cáo Doanh thu theo Nhà hàng
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chu kỳ
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3399df] focus:border-transparent outline-none"
            >
              <option value="day">Theo ngày</option>
              <option value="week">Theo tuần</option>
              <option value="month">Theo tháng</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Từ ngày
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3399df] focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đến ngày
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3399df] focus:border-transparent outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchRevenueData}
              className="w-full bg-[#3399df] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <FaCalendarAlt /> Xem báo cáo
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Tổng doanh thu</p>
              <h3 className="text-2xl font-bold">
                {formatCurrency(getTotalRevenue())}
              </h3>
            </div>
            <FaMoneyBillWave className="text-5xl text-green-200 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Tổng đơn hàng</p>
              <h3 className="text-2xl font-bold">{getTotalOrders()}</h3>
            </div>
            <FaShoppingCart className="text-5xl text-blue-200 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">Số nhà hàng</p>
              <h3 className="text-2xl font-bold">{revenueData.length}</h3>
            </div>
            <FaStore className="text-5xl text-purple-200 opacity-50" />
          </div>
        </div>
      </div>

      {/* Revenue Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Đang tải...</div>
          ) : revenueData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Không có dữ liệu trong khoảng thời gian này
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nhà hàng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Địa chỉ
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số đơn
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doanh thu
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trung bình/đơn
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {revenueData.map((item, index) => (
                  <tr
                    key={item.shopId}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.shop?.image && (
                          <img
                            src={item.shop.image}
                            alt={item.shopName}
                            className="w-10 h-10 rounded-full object-cover mr-3"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/40?text=Shop";
                            }}
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.shopName}
                          </div>
                          {item.shop?.contactPhone && (
                            <div className="text-xs text-gray-500">
                              {item.shop.contactPhone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.shopCity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                      {item.totalOrders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600 text-right">
                      {formatCurrency(item.totalRevenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                      {formatCurrency(item.averageOrderValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-4 text-sm font-bold text-gray-900"
                  >
                    TỔNG CỘNG
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                    {getTotalOrders()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600 text-right">
                    {formatCurrency(getTotalRevenue())}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-600 text-right">
                    {getTotalOrders() > 0
                      ? formatCurrency(getTotalRevenue() / getTotalOrders())
                      : formatCurrency(0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ReportRevenue;
