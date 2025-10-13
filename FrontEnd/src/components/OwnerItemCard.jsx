import axios from "axios";
import React from "react";
import { FaPen } from "react-icons/fa";
import { FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { serverURL } from "../App.jsx";
import { useDispatch } from "react-redux";
import { setMyShopData } from "../redux/ownerSlice.js";
function OwnerItemCard({ data }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleDeleteItem = async () => {
    try {
      const result = await axios.delete(
        `${serverURL}/api/item/delete/${data._id}`,
        { withCredentials: true }
      );
      dispatch(setMyShopData(result.data)); // nhớ thêm dispatch

      // Optionally, you might want to refresh the item list or give feedback to the user here
    } catch (error) {
      console.log(error);
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
        className="w-40 h-32 flex-shrink-0 bg-gray-50"
        style={{ marginRight: "15px" }}
      >
        <img
          src={data.image}
          alt={data.name}
          className="w-full h-full object-cover rounded-md"
        />
      </div>
      <div className="flex flex-col justify-between flex-1">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{data.name}</h2>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Category:</span> {data.category}
          </p>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="text-lg font-bold text-red-500">{data.price}</div>
          <div className="flex items-center space-x-2">
            <FaPen
              size={20}
              className="text-gray-500 cursor-pointer"
              onClick={() => navigate(`/edit-item/${data._id}`)}
            />
            <FaTrashAlt
              size={20}
              className="text-gray-500 cursor-pointer"
              onClick={handleDeleteItem}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default OwnerItemCard;
