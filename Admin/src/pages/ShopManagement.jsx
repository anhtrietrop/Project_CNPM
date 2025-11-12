import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import { serverURL } from "../App";
import {
  FaStore,
  FaCheck,
  FaTimes,
  FaTrash,
  FaSearch,
  FaClock,
  FaEye,
  FaPhoneAlt,
  FaEnvelope,
  FaUser,
  FaCreditCard,
  FaUniversity,
  FaImages,
} from "react-icons/fa";

const ShopManagement = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedShop, setSelectedShop] = useState(null);

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
      await axios.put(
        `${serverURL}/api/admin/shops/${shopId}/approve`,
        {},
        {
          withCredentials: true,
        }
      );
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
      await axios.put(
        `${serverURL}/api/admin/shops/${shopId}/reject`,
        { reason },
        {
          withCredentials: true,
        }
      );
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
            <div
              key={shop._id}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <img
                src={shop.image}
                alt={shop.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/400x300?text=No+Image";
                }}
              />
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg text-gray-800">
                    {shop.name}
                  </h3>
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
                  <p>
                    <span className="font-medium">Chủ:</span>{" "}
                    {shop.owner?.fullName}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {shop.owner?.email}
                  </p>
                  <p>
                    <span className="font-medium">Địa chỉ:</span> {shop.address}
                    , {shop.city}
                  </p>
                  {shop.contactPhone && (
                    <p className="flex items-center gap-1">
                      <FaPhoneAlt className="text-gray-400" />
                      <span className="font-medium">SĐT:</span>{" "}
                      {shop.contactPhone}
                    </p>
                  )}
                  {shop.representativeName && (
                    <p className="flex items-center gap-1">
                      <FaUser className="text-gray-400" />
                      <span className="font-medium">Đại diện:</span>{" "}
                      {shop.representativeName}
                    </p>
                  )}
                  {shop.categories && shop.categories.length > 0 && (
                    <p>
                      <span className="font-medium">Danh mục:</span>{" "}
                      <span className="text-xs">
                        {shop.categories.join(", ")}
                      </span>
                    </p>
                  )}
                </div>

                {shop.rejectedReason && (
                  <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                    <strong>Lý do từ chối:</strong> {shop.rejectedReason}
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedShop(shop)}
                    className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <FaEye /> Xem chi tiết
                  </button>

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
                      className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center justify-center gap-1"
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

      {/* Modal Chi tiết */}
      {selectedShop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                Chi tiết nhà hàng
              </h2>
              <button
                onClick={() => setSelectedShop(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Logo & Tên */}
              <div className="flex items-start gap-4">
                <img
                  src={selectedShop.image}
                  alt={selectedShop.name}
                  className="w-32 h-32 object-cover rounded-lg shadow-md"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/128?text=No+Image";
                  }}
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {selectedShop.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Chủ sở hữu:</span>{" "}
                    {selectedShop.owner?.fullName} ({selectedShop.owner?.email})
                  </p>
                  {selectedShop.isApproved ? (
                    <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                      ✓ Đã duyệt
                    </span>
                  ) : (
                    <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                      ⏱ Chờ duyệt
                    </span>
                  )}
                </div>
              </div>

              {/* Thông tin liên hệ */}
              <div className="border-t pt-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaPhoneAlt className="text-blue-500" /> Thông tin liên hệ
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <FaPhoneAlt className="text-gray-400" />
                    <span className="font-medium">SĐT:</span>
                    <span>{selectedShop.contactPhone || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="text-gray-400" />
                    <span className="font-medium">Email:</span>
                    <span>{selectedShop.contactEmail || "N/A"}</span>
                  </div>
                  <div className="col-span-2 flex items-start gap-2">
                    <FaStore className="text-gray-400 mt-1" />
                    <span className="font-medium">Địa chỉ:</span>
                    <span>
                      {selectedShop.address}, {selectedShop.state},{" "}
                      {selectedShop.city}
                    </span>
                  </div>
                  {selectedShop.operatingHours && (
                    <div className="col-span-2 flex items-center gap-2">
                      <FaClock className="text-gray-400" />
                      <span className="font-medium">Giờ hoạt động:</span>
                      <span>{selectedShop.operatingHours}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Người đại diện */}
              <div className="border-t pt-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaUser className="text-purple-500" /> Người đại diện
                </h4>
                <div className="text-sm space-y-2">
                  <p>
                    <span className="font-medium">Tên:</span>{" "}
                    {selectedShop.representativeName || "N/A"}
                  </p>
                  {selectedShop.representativeIdCard && (
                    <div>
                      <p className="font-medium mb-2">Ảnh CCCD/CMND:</p>
                      <img
                        src={selectedShop.representativeIdCard}
                        alt="ID Card"
                        className="max-w-md w-full h-auto object-contain rounded-lg border shadow-md"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Tài khoản ngân hàng */}
              <div className="border-t pt-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaCreditCard className="text-green-500" /> Tài khoản ngân
                  hàng
                </h4>
                <div className="text-sm space-y-2">
                  <p>
                    <span className="font-medium">Số TK:</span>{" "}
                    {selectedShop.bankAccountNumber || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Chủ TK:</span>{" "}
                    {selectedShop.bankAccountName || "N/A"}
                  </p>
                  <p className="flex items-center gap-2">
                    <FaUniversity className="text-gray-400" />
                    <span className="font-medium">Ngân hàng:</span>
                    <span>{selectedShop.bankName || "N/A"}</span>
                  </p>
                </div>
              </div>

              {/* Danh mục */}
              {selectedShop.categories &&
                selectedShop.categories.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">
                      Danh mục món ăn
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedShop.categories.map((cat, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Hình ảnh */}
              <div className="border-t pt-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaImages className="text-orange-500" /> Hình ảnh Menu
                </h4>

                {/* Ảnh menu */}
                {selectedShop.menuImages &&
                selectedShop.menuImages.length > 0 ? (
                  <div>
                    <p className="font-medium text-sm mb-2">
                      Menu ({selectedShop.menuImages.length} ảnh):
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedShop.menuImages.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Menu ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg shadow-md"
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Chưa có ảnh menu</p>
                )}
              </div>

              {/* Action buttons in modal */}
              {!selectedShop.isApproved && (
                <div className="border-t pt-4 flex gap-3">
                  <button
                    onClick={() => {
                      handleApprove(selectedShop._id);
                      setSelectedShop(null);
                    }}
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <FaCheck /> Duyệt nhà hàng
                  </button>
                  <button
                    onClick={() => {
                      handleReject(selectedShop._id);
                      setSelectedShop(null);
                    }}
                    className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <FaTimes /> Từ chối
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ShopManagement;
