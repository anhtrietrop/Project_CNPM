import React, { useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useToast } from "../hooks/useToast";
import useCart from "../hooks/useCart.jsx";
import { formatCurrency } from "../utils/formatCurrency.js";

function FoodItemCard({ data }) {
  const { addItemToCart, clearCart } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const isOutOfStock = data.stock === 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;

    // Kiểm tra đăng nhập
    if (!userData) {
      toast.info("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!", 3000);
      setTimeout(() => {
        navigate("/signin");
      }, 1000);
      return;
    }

    try {
      setLoading(true);
      // Truyền full item data vào cart
      await addItemToCart(data, 1);

      // Hiển thị toast thành công
      toast.success(`Đã thêm "${data.name}" vào giỏ hàng`, 2000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      
      // Kiểm tra lỗi từ backend về việc giỏ hàng đã có sản phẩm từ shop khác
      if (error.response?.data?.needClearCart) {
        const { newShop, message } = error.response.data;
        
        if (window.confirm(
          `${message}\n\nBạn có muốn xóa giỏ hàng hiện tại và thêm sản phẩm từ "${newShop}" không?`
        )) {
          try {
            await clearCart();
            await addItemToCart(data, 1);
            toast.success(`Đã thêm "${data.name}" vào giỏ hàng`, 2000);
          } catch {
            toast.error("Lỗi khi xóa giỏ hàng!");
          }
        }
      } else {
        toast.error(error.response?.data?.message || "Lỗi khi thêm vào giỏ hàng!");
      }
    } finally {
      setLoading(false);
    }
  };

  // Bỏ hiển thị số lượng ở ngoài

  return (
    <div
      className={`w-[200px] h-[280px] rounded-2xl border-2 border-[#3399df] shrink-0 overflow-hidden bg-white shadow-xl shadow-gray-200 hover:shadow-lg transition-shadow relative ${
        isOutOfStock ? "opacity-70" : ""
      }`}
    >
      <div className="relative">
        <img
          src={data.image}
          alt={data.name}
          className={`w-full h-32 object-cover transform hover:scale-110 transition-transform duration-300 ${
            isOutOfStock ? "grayscale blur-sm" : ""
          }`}
          onError={(e) => {
            console.error("Error loading food image:", data.image);
            e.target.src = "https://via.placeholder.com/200x128?text=No+Image";
          }}
        />

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-gray-800 bg-opacity-60 flex items-center justify-center">
            <span className="text-white font-bold text-lg">HẾT HÀNG</span>
          </div>
        )}
      </div>



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
          <div className="text-xs text-gray-500 mb-2">
            {data.shopName || data.shop?.name || "Unknown Shop"}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-lg font-bold text-[#3399df]">
            {formatCurrency(data.price)}
          </div>

          {/* Cart controls - Chỉ hiển thị nút Add */}
          <button
            onClick={handleAddToCart}
            disabled={loading || isOutOfStock}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              isOutOfStock
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-[#3399df] text-white hover:bg-blue-600"
            } disabled:opacity-50`}
          >
            {isOutOfStock ? "Hết hàng" : loading ? "..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FoodItemCard;
