import axios from "axios";
import React, { useState } from "react";
import { FaPen } from "react-icons/fa";
import { FaTrashAlt, FaPlus, FaMinus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { serverURL } from "../App.jsx";
import { useDispatch } from "react-redux";
import { setMyShopData } from "../redux/ownerSlice.js";
import { formatCurrency } from "../utils/formatCurrency.js";

function OwnerItemCard({ data }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [stock, setStock] = useState(data.stock || 0);
  const [updating, setUpdating] = useState(false);

  const handleDeleteItem = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      return;
    }
    try {
      const result = await axios.delete(
        `${serverURL}/api/item/delete/${data._id}`,
        { withCredentials: true }
      );
      dispatch(setMyShopData(result.data));
    } catch (error) {
      console.log(error);
      alert("Lỗi khi xóa sản phẩm!");
    }
  };

  const handleUpdateStock = async (newStock) => {
    if (newStock < 0) return;

    try {
      setUpdating(true);
      const result = await axios.put(
        `${serverURL}/api/item/update-stock/${data._id}`,
        { stock: newStock },
        { withCredentials: true }
      );
      dispatch(setMyShopData(result.data));
      setStock(newStock);
    } catch (error) {
      console.log(error);
      alert("Lỗi khi cập nhật số lượng!");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div
      className="flex bg-white rounded-lg shadow-md overflow-hidden border border-[#d3d3d3] w-full max-w-2xl"
      style={{
        border: "1px solid #d3d3d3",
        borderRadius: "8px",
        padding: "10px",
      }}
    >
      <div
        className="w-40 h-32 flex-shrink-0 bg-gray-50 relative"
        style={{ marginRight: "15px" }}
      >
        <img
          src={data.image}
          alt={data.name}
          className="w-full h-full object-cover rounded-md"
        />
        {stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md">
            <span className="text-white font-bold text-sm">HẾT HÀNG</span>
          </div>
        )}
      </div>
      <div className="flex flex-col justify-between flex-1">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{data.name}</h2>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Category:</span> {data.category}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">Số lượng:</span>
            <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-lg">
              <button
                onClick={() => handleUpdateStock(stock - 1)}
                disabled={updating || stock === 0}
                className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaMinus size={14} />
              </button>
              <span
                className={`font-bold min-w-[30px] text-center ${
                  stock === 0 ? "text-red-600" : "text-gray-800"
                }`}
              >
                {stock}
              </span>
              <button
                onClick={() => handleUpdateStock(stock + 1)}
                disabled={updating}
                className="text-green-500 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaPlus size={14} />
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="text-lg font-bold text-red-500">
            {formatCurrency(data.price)}
          </div>
          <div className="flex items-center space-x-2">
            <FaPen
              size={20}
              className="text-gray-500 cursor-pointer hover:text-blue-600"
              onClick={() => navigate(`/edit-item/${data._id}`)}
            />
            <FaTrashAlt
              size={20}
              className="text-gray-500 cursor-pointer hover:text-red-600"
              onClick={handleDeleteItem}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default OwnerItemCard;
