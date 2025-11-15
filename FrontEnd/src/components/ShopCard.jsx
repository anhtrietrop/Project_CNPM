import React from "react";

function ShopCard({ data }) {
  return (
    <div className="w-[280px] h-[200px] rounded-2xl border-2 border-[#3399df] shrink-0 overflow-hidden bg-white shadow-xl shadow-gray-200 hover:shadow-lg transition-shadow relative">
      <img
        src={data.image}
        alt={data.name}
        className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
        onError={(e) => {
          console.error("Error loading shop image:", data.image);
          e.target.style.display = "none";
        }}
      />
      <div className="absolute bottom-0 w-full left-0 bg-[#ffffff96] bg-opacity-95 px-3 py-2 rounded-t-xl text-center shadow text-sm font-medium text-gray-800 backdrop-blur">
        <div className="font-bold text-lg">{data.name}</div>
        <div className="text-xs text-gray-600">
          {data.location?.city || data.city}, {data.location?.state || data.state}
        </div>
        <div className="text-xs text-gray-500">
          {data.location?.address || data.address || "Chưa có địa chỉ"}
        </div>
      </div>
    </div>
  );
}

export default ShopCard;
