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
import { useToast } from "../hooks/useToast";

const ShopManagement = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedShop, setSelectedShop] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [shopToReject, setShopToReject] = useState(null);
  const toast = useToast();

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
      toast.error("Lỗi khi tải danh sách nhà hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (shopId) => {
    try {
      await axios.put(
        `${serverURL}/api/admin/shops/${shopId}/approve`,
        {},
        {
          withCredentials: true,
        }
      );
      toast.success("Duyệt nhà hàng thành công");
      fetchShops();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi duyệt nhà hàng");
    }
  };

  const handleReject = (shopId) => {
    setShopToReject(shopId);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      await axios.put(
        `${serverURL}/api/admin/shops/${shopToReject}/reject`,
        { reason: rejectReason },
        {
          withCredentials: true,
        }
      );
      toast.success("Từ chối nhà hàng thành công");
      setShowRejectModal(false);
      setRejectReason("");
      setShopToReject(null);
      fetchShops();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi từ chối nhà hàng");
    }
  };

  const handleDelete = async (shopId) => {
    try {
      await axios.delete(`${serverURL}/api/admin/shops/${shopId}`, {
        withCredentials: true,
      });
      toast.success("Xóa nhà hàng thành công");
      fetchShops();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi xóa nhà hàng");
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
            <div className="sticky top-0 bg-white border-b px-6 py-6 flex items-center justify-center">
              <h2 className="text-4xl font-bold text-gray-800">
                Chi tiết nhà hàng
              </h2>
              <button
                onClick={() => setSelectedShop(null)}
                className="absolute right-6 text-gray-500 hover:text-gray-700 text-4xl"
              >
                ×
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Logo & Tên */}
              <div className="flex flex-col items-center gap-6 text-center">
                <img
                  src={selectedShop.image}
                  alt={selectedShop.name}
                  className="w-64 h-64 object-cover rounded-lg shadow-lg"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/256?text=No+Image";
                  }}
                />
                <div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-3">
                    {selectedShop.name}
                  </h3>
                  <p className="text-lg text-gray-600">
                    <span className="font-medium">Chủ sở hữu:</span>{" "}
                    {selectedShop.owner?.fullName} ({selectedShop.owner?.email})
                  </p>
                  {selectedShop.isApproved ? (
                    <span className="inline-block mt-3 px-5 py-2 bg-green-100 text-green-800 text-lg font-semibold rounded-full">
                      ✓ Đã duyệt
                    </span>
                  ) : (
                    <span className="inline-block mt-3 px-5 py-2 bg-yellow-100 text-yellow-800 text-lg font-semibold rounded-full">
                      ⏱ Chờ duyệt
                    </span>
                  )}
                </div>
              </div>

              {/* Thông tin liên hệ */}
              <div className="border-t pt-6">
                <h4 className="text-2xl font-semibold text-gray-800 mb-5 flex items-center justify-center gap-3">
                  <FaPhoneAlt className="text-blue-500 text-xl" /> Thông tin
                  liên hệ
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg max-w-3xl mx-auto">
                  <div className="flex items-center gap-3">
                    <FaPhoneAlt className="text-gray-400 text-xl" />
                    <span className="font-medium">SĐT:</span>
                    <span>{selectedShop.contactPhone || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaEnvelope className="text-gray-400 text-xl" />
                    <span className="font-medium">Email:</span>
                    <span>{selectedShop.contactEmail || "N/A"}</span>
                  </div>
                  <div className="col-span-2 flex items-start gap-3">
                    <FaStore className="text-gray-400 mt-1 text-xl" />
                    <span className="font-medium">Địa chỉ:</span>
                    <span>
                      {selectedShop.address}, {selectedShop.state},{" "}
                      {selectedShop.city}
                    </span>
                  </div>
                  {selectedShop.operatingHours && (
                    <div className="col-span-2 flex items-center gap-3">
                      <FaClock className="text-gray-400 text-xl" />
                      <span className="font-medium">Giờ hoạt động:</span>
                      <span>{selectedShop.operatingHours}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Người đại diện */}
              <div className="border-t pt-6">
                <h4 className="text-2xl font-semibold text-gray-800 mb-5 flex items-center justify-center gap-3">
                  <FaUser className="text-purple-500 text-xl" /> Người đại diện
                </h4>
                <div className="text-lg space-y-4 max-w-3xl mx-auto text-center">
                  <p>
                    <span className="font-medium">Tên:</span>{" "}
                    {selectedShop.representativeName || "N/A"}
                  </p>
                  {selectedShop.representativeIdCard && (
                    <div className="flex flex-col items-center">
                      <p className="font-medium mb-3 text-xl">Ảnh CCCD/CMND:</p>
                      <img
                        src={selectedShop.representativeIdCard}
                        alt="ID Card"
                        className="max-w-2xl w-full h-auto object-contain rounded-lg border shadow-lg"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Tài khoản ngân hàng */}
              <div className="border-t pt-6">
                <h4 className="text-2xl font-semibold text-gray-800 mb-5 flex items-center justify-center gap-3">
                  <FaCreditCard className="text-green-500 text-xl" /> Tài khoản
                  ngân hàng
                </h4>
                <div className="text-lg space-y-3 max-w-3xl mx-auto text-center">
                  <p>
                    <span className="font-medium">Số TK:</span>{" "}
                    {selectedShop.bankAccountNumber || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Chủ TK:</span>{" "}
                    {selectedShop.bankAccountName || "N/A"}
                  </p>
                  <p className="flex items-center justify-center gap-3">
                    <FaUniversity className="text-gray-400 text-xl" />
                    <span className="font-medium">Ngân hàng:</span>
                    <span>{selectedShop.bankName || "N/A"}</span>
                  </p>
                </div>
              </div>

              {/* Danh mục */}
              {selectedShop.categories &&
                selectedShop.categories.length > 0 && (
                  <div className="border-t pt-6">
                    <h4 className="text-2xl font-semibold text-gray-800 mb-5 text-center">
                      Danh mục món ăn
                    </h4>
                    <div className="flex flex-wrap gap-3 justify-center max-w-3xl mx-auto">
                      {selectedShop.categories.map((cat, idx) => (
                        <span
                          key={idx}
                          className="px-5 py-2 bg-blue-100 text-blue-800 rounded-full text-lg font-medium"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Hình ảnh */}
              <div className="border-t pt-6">
                <h4 className="text-2xl font-semibold text-gray-800 mb-5 flex items-center justify-center gap-3">
                  <FaImages className="text-orange-500 text-xl" /> Hình ảnh Menu
                </h4>

                {/* Ảnh menu */}
                {selectedShop.menuImages &&
                selectedShop.menuImages.length > 0 ? (
                  <div className="max-w-4xl mx-auto">
                    <p className="font-medium text-lg mb-4 text-center">
                      Menu ({selectedShop.menuImages.length} ảnh):
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {selectedShop.menuImages.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Menu ${idx + 1}`}
                          className="w-full h-64 object-cover rounded-lg shadow-lg"
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-lg text-gray-500 text-center">
                    Chưa có ảnh menu
                  </p>
                )}
              </div>

              {/* Action buttons in modal */}
              {!selectedShop.isApproved && (
                <div className="border-t pt-6 flex gap-5 max-w-3xl mx-auto">
                  <button
                    onClick={() => {
                      handleApprove(selectedShop._id);
                      setSelectedShop(null);
                    }}
                    className="flex-1 bg-green-500 text-white px-6 py-4 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-3 text-lg"
                  >
                    <FaCheck className="text-xl" /> Duyệt nhà hàng
                  </button>
                  <button
                    onClick={() => {
                      handleReject(selectedShop._id);
                      setSelectedShop(null);
                    }}
                    className="flex-1 bg-red-500 text-white px-6 py-4 rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center justify-center gap-3 text-lg"
                  >
                    <FaTimes className="text-xl" /> Từ chối
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[10000] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Từ chối nhà hàng
            </h3>
            <p className="text-gray-600 mb-4">
              Vui lòng nhập lý do từ chối nhà hàng này:
            </p>
            <div className="mb-4">
              <textarea
                placeholder="Nhập lý do từ chối..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={confirmReject}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Xác nhận từ chối
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                  setShopToReject(null);
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ShopManagement;
