import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import { serverURL } from "../App";
import { FaStore, FaCheck, FaTimes, FaTrash, FaSearch, FaClock } from "react-icons/fa";

const ShopManagement = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchShops();
  }, [filter, search]);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${serverURL}/api/admin/shops`, {
        params: { status: filter !== "all" ? filter : undefined, search },
        withCredentials: true,
      });
      setShops(response.data.data);
    } catch (error) {
      console.error("Error fetching shops:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (shopId) => {
    if (!window.confirm("Bạn có chắc muốn duyệt nhà hàng này?")) return;

    try {
      await axios.put(`${serverURL}/api/admin/shops/${shopId}/approve`, {}, {
        withCredentials: true,
      });
      alert("Duyệt nhà hàng thành công");
      fetchShops();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi khi duyệt nhà hàng");
    }
  };

  const handleReject = async (shopId) => {
    const reason = window.prompt("Lý do từ chối:");
    if (!reason) return;

    try {
      await axios.put(`${serverURL}/api/admin/shops/${shopId}/reject`, { reason }, {
        withCredentials: true,
      });
      alert("Từ chối nhà hàng thành công");
      fetchShops();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi khi từ chối nhà hàng");
    }
  };

  const handleDelete = async (shopId) => {
    if (!window.confirm("Bạn có chắc muốn xóa nhà hàng này?")) return;

    try {
      await axios.delete(`${serverURL}/api/admin/shops/${shopId}`, {
        withCredentials: true,
      });
      alert("Xóa nhà hàng thành công");
      fetchShops();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi khi xóa nhà hàng");
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <FaStore className="text-[#3399df]" />
          Quản lý Nhà hàng
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex gap-2">
            {[
              { value: "all", label: "Tất cả" },
              { value: "pending", label: "Chờ duyệt" },
              { value: "approved", label: "Đã duyệt" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === option.value
                    ? "bg-[#3399df] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm nhà hàng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3399df] focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Shops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            Đang tải...
          </div>
        ) : shops.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            Không tìm thấy nhà hàng
          </div>
        ) : (
          shops.map((shop) => (
            <div key={shop._id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <img
                src={shop.image}
                alt={shop.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
                }}
              />
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg text-gray-800">{shop.name}</h3>
                  {shop.isApproved ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full flex items-center gap-1">
                      <FaCheck /> Đã duyệt
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full flex items-center gap-1">
                      <FaClock /> Chờ duyệt
                    </span>
                  )}
                </div>
                
                <div className="text-sm text-gray-600 space-y-1 mb-3">
                  <p><span className="font-medium">Chủ:</span> {shop.owner?.fullName}</p>
                  <p><span className="font-medium">Email:</span> {shop.owner?.email}</p>
                  <p><span className="font-medium">Địa chỉ:</span> {shop.address}, {shop.city}</p>
                </div>

                {shop.rejectedReason && (
                  <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                    <strong>Lý do từ chối:</strong> {shop.rejectedReason}
                  </div>
                )}

                <div className="flex gap-2">
                  {!shop.isApproved ? (
                    <>
                      <button
                        onClick={() => handleApprove(shop._id)}
                        className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <FaCheck /> Duyệt
                      </button>
                      <button
                        onClick={() => handleReject(shop._id)}
                        className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <FaTimes /> Từ chối
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleDelete(shop._id)}
                      className="w-full bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <FaTrash /> Xóa
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
};

export default ShopManagement;
