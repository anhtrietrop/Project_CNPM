import React, { useState, useEffect } from "react";
import axios from "axios";
import { serverURL } from "../App.jsx";
import { useSelector } from "react-redux";
import { useToast } from "../hooks/useToast.jsx";
import {
  FaHelicopter,
  FaPlus,
  FaEdit,
  FaTrash,
  FaBatteryFull,
  FaBatteryHalf,
  FaBatteryQuarter,
  FaCheckCircle,
  FaClock,
  FaTools,
  FaTimes,
} from "react-icons/fa";
import Loading from "./Loading.jsx";

const DroneManagement = () => {
  const { myShopData } = useSelector((state) => state.owner);
  const [drones, setDrones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDrone, setEditingDrone] = useState(null);
  const [formData, setFormData] = useState({
    model: "",
    serialNumber: "",
  });
  const [showBatteryModal, setShowBatteryModal] = useState(false);
  const [selectedDrone, setSelectedDrone] = useState(null);
  const [batteryPercentage, setBatteryPercentage] = useState(100);
  const toast = useToast();

  useEffect(() => {
    fetchDrones();
  }, []);

  const fetchDrones = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${serverURL}/api/drone/my-drones`, {
        withCredentials: true,
      });
      setDrones(response.data.data || []);
    } catch (err) {
      console.error("Error fetching drones:", err);
      setError(err.response?.data?.message || "Không thể tải danh sách drone");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra shop đã được duyệt chưa
    if (!myShopData?.isApproved) {
      toast.error("Nhà hàng của bạn chưa được Admin duyệt. Vui lòng chờ để thêm drone!");
      return;
    }

    try {
      setLoading(true);

      if (editingDrone) {
        // Update drone
        await axios.put(
          `${serverURL}/api/drone/${editingDrone._id}`,
          formData,
          { withCredentials: true }
        );
        toast.success("Cập nhật drone thành công!");
      } else {
        // Create drone
        await axios.post(`${serverURL}/api/drone`, formData, {
          withCredentials: true,
        });
        toast.success("Tạo drone thành công!");
      }

      setShowModal(false);
      resetForm();
      fetchDrones();
    } catch (err) {
      console.error("Error saving drone:", err);
      toast.error(err.response?.data?.message || "Lỗi khi lưu drone!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (droneId) => {
    if (!window.confirm("Bạn có chắc muốn xóa drone này?")) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`${serverURL}/api/drone/${droneId}`, {
        withCredentials: true,
      });
      toast.success("Xóa drone thành công!");
      fetchDrones();
    } catch (err) {
      console.error("Error deleting drone:", err);
      toast.error(err.response?.data?.message || "Lỗi khi xóa drone!");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (drone) => {
    setEditingDrone(drone);
    setFormData({
      model: drone.model,
      serialNumber: drone.serialNumber,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingDrone(null);
    setFormData({
      model: "",
      serialNumber: "",
    });
  };

  const handleOpenBatteryModal = (drone) => {
    setSelectedDrone(drone);
    setBatteryPercentage(drone.battery.current);
    setShowBatteryModal(true);
  };

  const handleUpdateBattery = async () => {
    if (!selectedDrone) return;

    if (batteryPercentage < 0 || batteryPercentage > 100) {
      toast.error("Phần trăm pin phải từ 0 đến 100!");
      return;
    }

    try {
      setLoading(true);

      await axios.put(
        `${serverURL}/api/drone/${selectedDrone._id}/battery`,
        { batteryPercentage: Number(batteryPercentage) },
        { withCredentials: true }
      );

      toast.success("Cập nhật pin drone thành công!");
      setShowBatteryModal(false);
      setSelectedDrone(null);
      fetchDrones();
    } catch (err) {
      console.error("Error updating drone battery:", err);
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật pin drone!");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    const statusMap = {
      available: <FaCheckCircle className="text-green-500" />,
      busy: <FaClock className="text-yellow-500" />,
      maintenance: <FaTools className="text-orange-500" />,
      offline: <FaTimes className="text-red-500" />,
    };
    return statusMap[status] || null;
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      available: "Sẵn sàng",
      busy: "Đang bận",
      maintenance: "Bảo trì",
      offline: "Offline",
      retired: "Ngừng hoạt động",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      available: "bg-green-100 text-green-800 border-green-300",
      busy: "bg-yellow-100 text-yellow-800 border-yellow-300",
      maintenance: "bg-orange-100 text-orange-800 border-orange-300",
      offline: "bg-red-100 text-red-800 border-red-300",
      retired: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  const getBatteryIcon = (battery) => {
    if (battery >= 70) return <FaBatteryFull className="text-green-500" />;
    if (battery >= 30) return <FaBatteryHalf className="text-yellow-500" />;
    return <FaBatteryQuarter className="text-red-500" />;
  };

  if (loading && drones.length === 0) {
    return <Loading />;
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaHelicopter className="text-[#3399df]" />
          Quản lý Drone
        </h2>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-[#3399df] text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
        >
          <FaPlus />
          Thêm Drone
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {drones.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <FaHelicopter className="text-gray-300 w-16 h-16 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Chưa có drone nào</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 bg-[#3399df] text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Thêm Drone đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drones.map((drone) => (
            <div
              key={drone._id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="bg-gradient-to-r from-[#3399df] to-blue-500 text-white px-4 py-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{drone.model}</h3>
                    <p className="text-sm opacity-90">SN: {drone.serialNumber}</p>
                    <p className="text-xs opacity-75 font-mono mt-1">
                      ID: {drone._id}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `Drone ID: ${drone._id}\nSerial: ${drone.serialNumber}`
                      );
                      alert("Đã copy thông tin drone!");
                    }}
                    className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                    title="Copy thông tin drone"
                  >
                    📋
                  </button>
                </div>
              </div>

              <div className="p-4">
                {/* Status and Battery */}
                <div className="mb-3 flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border-2 flex items-center gap-1 ${getStatusColor(
                      drone.status
                    )}`}
                  >
                    {getStatusIcon(drone.status)}
                    <span>{getStatusLabel(drone.status)}</span>
                  </span>
                  <div
                    className="flex items-center gap-1 text-lg cursor-pointer hover:opacity-70 transition-opacity"
                    onClick={() => handleOpenBatteryModal(drone)}
                    title="Click để cập nhật pin"
                  >
                    {getBatteryIcon(drone.battery.current)}
                    <span className="text-sm font-medium">
                      {drone.battery.current}%
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(drone)}
                    className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <FaEdit />
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(drone._id)}
                    className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <FaTrash />
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Create/Edit Drone */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaHelicopter className="text-[#3399df]" />
                {editingDrone ? "Chỉnh sửa Drone" : "Thêm Drone mới"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Model */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên Drone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="VD: DJI Mavic 3"
                    required
                  />
                </div>

                {/* Serial Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã Drone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, serialNumber: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="VD: DRN-2024-001"
                    required
                    disabled={editingDrone !== null}
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#3399df] text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? "Đang xử lý..."
                      : editingDrone
                      ? "Cập nhật"
                      : "Tạo mới"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Battery Update Modal */}
      {showBatteryModal && selectedDrone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                {getBatteryIcon(batteryPercentage)}
                Cập nhật Pin Drone
              </h3>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">
                  Drone:{" "}
                  <span className="font-semibold">{selectedDrone.model}</span>
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  SN:{" "}
                  <span className="font-semibold">
                    {selectedDrone.serialNumber}
                  </span>
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Pin hiện tại:{" "}
                  <span
                    className={`font-semibold ${
                      selectedDrone.battery.current >= 70
                        ? "text-green-600"
                        : selectedDrone.battery.current >= 30
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedDrone.battery.current}%
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
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#3399df] text-lg font-semibold text-center"
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
                    ⚠️ Cảnh báo: Pin thấp! Cần sạc ngay
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
                    setSelectedDrone(null);
                  }}
                  disabled={loading}
                  className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-medium disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdateBattery}
                  disabled={
                    loading || batteryPercentage < 0 || batteryPercentage > 100
                  }
                  className="flex-1 bg-[#3399df] text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Đang cập nhật..." : "Xác nhận"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DroneManagement;
