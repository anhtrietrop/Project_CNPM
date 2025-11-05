import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaPlus, FaMinus, FaShoppingCart } from "react-icons/fa";
import useCart from "../hooks/useCart.jsx";
import { formatCurrency } from "../utils/formatCurrency.js";

function Cart({ isOpen, onClose }) {
  const navigate = useNavigate();
  // ✅ SỬ DỤNG cart TỪ HOOK thay vì từ prop
  const { cart, loading, removeFromCart, updateCartItem, clearCart } =
    useCart();
  const [updatingItems, setUpdatingItems] = useState(new Set());

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      await removeFromCart(itemId);
      return;
    }

    try {
      setUpdatingItems((prev) => new Set(prev).add(itemId));
      await updateCartItem(itemId, newQuantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setUpdatingItems((prev) => new Set(prev).add(itemId));
      await removeFromCart(itemId);
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleClearCart = async () => {
    if (window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) {
      try {
        await clearCart();
      } catch (error) {
        console.error("Error clearing cart:", error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[#fff9f6] rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaShoppingCart />
            Giỏ hàng
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Cart Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {loading && !cart ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3399df]"></div>
            </div>
          ) : (!cart?.cartItems || cart.cartItems.length === 0) &&
            (!cart?.items || cart.items.length === 0) ? (
            <div className="text-center py-8">
              <FaShoppingCart className="mx-auto text-4xl text-gray-300 mb-4" />
              <p className="text-gray-500">Giỏ hàng trống</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(cart.cartItems || cart.items || []).map((cartItem) => (
                <div
                  key={cartItem.itemId}
                  className="flex items-center gap-4 p-3 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <img
                    src={cartItem.itemImage}
                    alt={cartItem.itemName}
                    className="w-16 h-16 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/64x64?text=No+Image";
                    }}
                  />

                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">
                      {cartItem.itemName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {cartItem.itemCategory} • {cartItem.itemFoodType}
                    </p>
                    <p className="text-sm text-gray-500">
                      Shop: {cartItem.shopName}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleQuantityChange(
                          cartItem.itemId,
                          cartItem.quantity - 1
                        )
                      }
                      disabled={updatingItems.has(cartItem.itemId)}
                      className="bg-gray-200 text-gray-600 p-1 rounded-full hover:bg-gray-300 disabled:opacity-50 transition-colors"
                    >
                      <FaMinus className="text-xs" />
                    </button>

                    <span className="w-8 text-center font-medium">
                      {cartItem.quantity}
                    </span>

                    <button
                      onClick={() =>
                        handleQuantityChange(
                          cartItem.itemId,
                          cartItem.quantity + 1
                        )
                      }
                      disabled={updatingItems.has(cartItem.itemId)}
                      className="bg-[#3399df] text-white p-1 rounded-full hover:bg-blue-600 disabled:opacity-50 transition-colors"
                    >
                      <FaPlus className="text-xs" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-[#3399df]">
                      {formatCurrency(
                        cartItem.subtotal || cartItem.price * cartItem.quantity
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(cartItem.price)} mỗi món
                    </p>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(cartItem.itemId)}
                    disabled={updatingItems.has(cartItem.itemId)}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {((cart?.cartItems && cart.cartItems.length > 0) ||
          (cart?.items && cart.items.length > 0)) && (
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold">Tổng cộng:</span>
              <span className="text-xl font-bold text-[#3399df]">
                {formatCurrency(cart.totalAmount || 0)}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleClearCart}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Xóa giỏ hàng
              </button>
              <button
                onClick={() => {
                  onClose();
                  navigate("/checkout");
                }}
                className="flex-1 bg-[#3399df] text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Thanh toán
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
