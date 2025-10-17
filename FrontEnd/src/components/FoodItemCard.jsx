import React, { useState } from "react";
import { FaPlus, FaMinus, FaStar } from "react-icons/fa";
import useCart from "../hooks/useCart.jsx";

function FoodItemCard({ data }) {
  const { addItemToCart } = useCart();
  const [loading, setLoading] = useState(false);

  const handleAddToCart = () => {
    try {
      setLoading(true);
      // Truyền full item data vào cart
      addItemToCart(data, 1);
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStar key={i} className="text-yellow-400 opacity-50" />);
      } else {
        stars.push(<FaStar key={i} className="text-gray-300" />);
      }
    }
    return stars;
  };

  // Bỏ hiển thị số lượng ở ngoài

  return (
    <div className="w-[200px] h-[280px] rounded-2xl border-2 border-[#3399df] shrink-0 overflow-hidden bg-white shadow-xl shadow-gray-200 hover:shadow-lg transition-shadow relative">
      <img
        src={data.image}
        alt={data.name}
        className="w-full h-32 object-cover transform hover:scale-110 transition-transform duration-300"
        onError={(e) => {
          console.error("Error loading food image:", data.image);
          e.target.style.display = "none";
        }}
      />

      {/* Rating display */}
      {data.rating > 0 && (
        <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded-full flex items-center gap-1">
          <FaStar className="text-yellow-400 text-xs" />
          <span className="text-xs font-medium">{data.rating}</span>
        </div>
      )}

      {/* Food type indicator - TẮT */}
      {/* <div className="absolute top-2 left-2">
        {data.foodType === "veg" ? (
          <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            🥬 Veg
          </div>
        ) : (
          <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            🍖 Non-Veg
          </div>
        )}
      </div> */}

      <div className="p-3 flex flex-col justify-between h-[148px]">
        <div>
          <div className="font-bold text-sm text-gray-800 mb-1 line-clamp-2">
            {data.name}
          </div>
          <div className="text-xs text-gray-600 mb-1">{data.category}</div>
          <div className="text-xs text-gray-500 mb-1">
            {data.shopName || data.shop?.name || "Unknown Shop"}
          </div>

          {/* Rating stars */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">{renderStars(data.rating || 0)}</div>
            <span className="text-xs text-gray-500">
              ({data.ratingCount || 0})
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-lg font-bold text-[#3399df]">${data.price}</div>

          {/* Cart controls - Chỉ hiển thị nút Add */}
          <button
            onClick={handleAddToCart}
            disabled={loading}
            className="bg-[#3399df] text-white px-3 py-1 rounded-full text-xs font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? "..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FoodItemCard;
