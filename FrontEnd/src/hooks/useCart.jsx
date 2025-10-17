import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import {
  addToCart as addToCartAction,
  updateCartItem as updateCartItemAction,
  removeFromCart as removeFromCartAction,
  clearCart as clearCartAction,
} from "../redux/cartSlice.js";

function useCart() {
  // Lấy cart từ Redux store
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy giỏ hàng (không cần gọi API nữa, đã có trong Redux)
  const getCart = () => {
    return cart;
  };

  // Thêm vào giỏ hàng
  const addToCart = async (itemId, quantity = 1) => {
    try {
      setLoading(true);
      setError(null);

      // Giả lập việc fetch item data (trong thực tế bạn có thể đã có data này)
      // Nếu bạn cần fetch item từ API, có thể làm ở đây
      // Tạm thời giả sử item data đã có sẵn hoặc được truyền vào

      // Dispatch action để thêm vào Redux store
      dispatch(addToCartAction({ item: { _id: itemId, price: 0 }, quantity }));

      return cart;
    } catch (err) {
      setError(err.message || "Failed to add to cart");
      console.error("Add to cart error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Thêm vào giỏ hàng với full item data
  const addItemToCart = (item, quantity = 1) => {
    try {
      setLoading(true);
      setError(null);

      dispatch(addToCartAction({ item, quantity }));

      return cart;
    } catch (err) {
      setError(err.message || "Failed to add to cart");
      console.error("Add to cart error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật số lượng
  const updateCartItem = (itemId, quantity) => {
    try {
      setLoading(true);
      setError(null);

      dispatch(updateCartItemAction({ itemId, quantity }));

      return cart;
    } catch (err) {
      setError(err.message || "Failed to update cart item");
      console.error("Update cart item error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Xóa khỏi giỏ hàng
  const removeFromCart = (itemId) => {
    try {
      setLoading(true);
      setError(null);

      dispatch(removeFromCartAction(itemId));

      return cart;
    } catch (err) {
      setError(err.message || "Failed to remove from cart");
      console.error("Remove from cart error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Xóa toàn bộ giỏ hàng
  const clearCart = () => {
    try {
      setLoading(true);
      setError(null);

      dispatch(clearCartAction());
    } catch (err) {
      setError(err.message || "Failed to clear cart");
      console.error("Clear cart error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra item có trong cart không
  const isInCart = (itemId) => {
    if (!cart?.items) return false;
    return cart.items.some((item) => item.item._id === itemId);
  };

  // Lấy quantity của item trong cart
  const getItemQuantity = (itemId) => {
    if (!cart?.items) return 0;
    const cartItem = cart.items.find((item) => item.item._id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  return {
    cart,
    loading,
    error,
    getCart,
    addToCart,
    addItemToCart, // Thêm function mới này để add với full item data
    updateCartItem,
    removeFromCart,
    clearCart,
    isInCart,
    getItemQuantity,
  };
}

export default useCart;
