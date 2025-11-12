import React, { useState } from "react";
import Nav from "./Nav.jsx";
import { FaUtensils, FaPen, FaClock, FaCheck, FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useGetMyShop from "../hooks/useGetMyShop.jsx";
import OwnerItemCard from "./ownerItemCard.jsx";
import MyOrders from "./MyOrders.jsx";
import DroneManagement from "./DroneManagement.jsx";

function OwnerDashboard() {
  const { myShopData } = useSelector((state) => state.owner);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("shop"); // "shop", "orders", or "drones"

  useGetMyShop(); // Fetch shop data when component mounts

  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex flex-col items-center">
      <Nav />

      {/* Tabs - Only show if shop exists */}
      {myShopData && (
        <div className="w-full max-w-6xl px-4 mt-6">
          <div className="flex gap-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("shop")}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === "shop"
                  ? "text-[#3399df] border-b-2 border-[#3399df]"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Quản lý Shop
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === "orders"
                  ? "text-[#3399df] border-b-2 border-[#3399df]"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Đơn hàng
            </button>
            <button
              onClick={() => setActiveTab("drones")}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === "drones"
                  ? "text-[#3399df] border-b-2 border-[#3399df]"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Drone
            </button>
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === "orders" && myShopData ? (
        <MyOrders />
      ) : activeTab === "drones" && myShopData ? (
        <DroneManagement />
      ) : (
        <>
          {!myShopData && (
            <div className="flex justify-center items-center p-4 sm:p-6">
              <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-x1 transition-shadow duration-300">
                <div className="flex flex-col items-center text-center">
                  <FaUtensils className="text-[#3399df] w-16 h-16 sm:w-20 sm:h-20 mb-4" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 ">
                    Thêm nhà hàng của bạn
                  </h2>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base">
                    Tham gia nền tảng giao đồ ăn nhanh của chúng tôi và tiếp cận
                    hàng nghìn khách hàng mỗi ngày
                  </p>
                  <button
                    className="bg-[#3399df] text-white px-5 sm:px-6 py-2 rounded-full font-medium shadow-md hover:bg-blue-600 transition-colors duration-200 "
                    onClick={() => navigate("/create-edit-shop")}
                  >
                    Bắt đầu ngay
                  </button>
                </div>
              </div>
            </div>
          )}
          {myShopData && (
            <div className="w-full flex flex-col items-center gap-6 px-4 sm:px-6">
              <h1 className="text-2xl sm:text-3xl text-gray-900 flex items-center gap-3 mt-8 text-center">
                <FaUtensils className="text-[#3399df] w-14 h-14 " />
                Chào mừng đến {myShopData.name}
              </h1>

              {/* Approval Status Banner */}
              {!myShopData.isApproved && (
                <div className="w-full max-w-3xl bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow-md">
                  <div className="flex items-start gap-3">
                    <FaClock className="text-yellow-500 text-2xl mt-1" />
                    <div className="flex-1">
                      <h3 className="font-bold text-yellow-800 mb-1">
                        Đang chờ Admin duyệt
                      </h3>
                      <p className="text-yellow-700 text-sm">
                        Nhà hàng của bạn đang được xem xét. Bạn chỉ có thể thêm
                        món ăn sau khi Admin duyệt nhà hàng.
                      </p>
                      {myShopData.rejectedReason && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          <strong>Lý do từ chối:</strong>{" "}
                          {myShopData.rejectedReason}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {myShopData.isApproved && (
                <div className="w-full max-w-3xl bg-green-50 border-l-4 border-green-400 p-4 rounded-lg shadow-md">
                  <div className="flex items-start gap-3">
                    <FaCheck className="text-green-500 text-2xl mt-1" />
                    <div>
                      <h3 className="font-bold text-green-800 mb-1">
                        Nhà hàng đã được duyệt
                      </h3>
                      <p className="text-green-700 text-sm">
                        Nhà hàng của bạn đang hoạt động và hiển thị cho khách
                        hàng!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-blue-100 hover:shadow-2xl transition-all duration-300 w-full max-w-3xl relative">
                <img
                  src={myShopData.image}
                  alt={myShopData.name}
                  className="w-full h-48 sm:h-64 object-cover"
                />
                <div
                  className="absolute top-4 right-4 bg-[#3399df] text-white p-2 rounded-full shadow-md hover:bg-blue-600 transition-colors duration-200 cursor-pointer"
                  onClick={() => navigate("/create-edit-shop")}
                >
                  <FaPen size={20} />
                </div>

                <div className="bg-white shadow-lg rounded-xl p-6 border border-blue-100 w-full max-w-3xl">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    {myShopData.name}
                  </h2>
                  <div className="space-y-2">
                    <p className="text-gray-600">
                      <span className="font-medium">Vị trí:</span>{" "}
                      {myShopData.city}, {myShopData.state}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Địa chỉ:</span>{" "}
                      {myShopData.address}
                    </p>
                  </div>
                </div>
              </div>
              {myShopData?.items?.length === 0 && (
                <div className="flex justify-center items-center p-4 sm:p-6">
                  <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-x1 transition-shadow duration-300">
                    <div className="flex flex-col items-center text-center">
                      <FaUtensils className="text-[#3399df] w-16 h-16 sm:w-20 sm:h-20 mb-4" />
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 ">
                        Thêm món ăn của bạn
                      </h2>
                      <p className="text-gray-600 mb-4 text-sm sm:text-base">
                        Thêm những món ăn ngon của bạn
                      </p>
                      <button
                        className={`px-5 sm:px-6 py-2 rounded-full font-medium shadow-md transition-colors duration-200 ${
                          myShopData.isApproved
                            ? "bg-[#3399df] text-white hover:bg-blue-600"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                        onClick={() =>
                          myShopData.isApproved && navigate("/add-item")
                        }
                        disabled={!myShopData.isApproved}
                      >
                        {myShopData.isApproved ? "Thêm món ăn" : "Chờ duyệt"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {myShopData?.items?.length > 0 && (
                <div className="flex flex-col items-center gap-4 w-full max-w-3xl">
                  {myShopData.items.map((item, index) => (
                    <OwnerItemCard data={item} key={index} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default OwnerDashboard;
