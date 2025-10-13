import { useEffect, useState } from "react";
import axios from "axios";
import { serverURL } from "../App.jsx";

function useCart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy giỏ hàng
  const getCart = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${serverURL}/api/cart`, {
        withCredentials: true,
      });
      setCart(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to get cart");
      console.error("Get cart error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Thêm vào giỏ hàng
  const addToCart = async (itemId, quantity = 1) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${serverURL}/api/cart/add`,
        { itemId, quantity },
        { withCredentials: true }
      );
      setCart(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add to cart");
      console.error("Add to cart error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật số lượng
  const updateCartItem = async (itemId, quantity) => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${serverURL}/api/cart/update/${itemId}`,
        { quantity },
        { withCredentials: true }
      );
      setCart(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update cart item");
      console.error("Update cart item error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Xóa khỏi giỏ hàng
  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);
      const response = await axios.delete(
        `${serverURL}/api/cart/remove/${itemId}`,
        { withCredentials: true }
      );
      setCart(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove from cart");
      console.error("Remove from cart error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Xóa toàn bộ giỏ hàng
  const clearCart = async () => {
    try {
      setLoading(true);
      await axios.delete(`${serverURL}/api/cart/clear`, {
        withCredentials: true,
      });
      setCart({ items: [], totalAmount: 0 });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to clear cart");
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

  useEffect(() => {
    getCart();
  }, []);

  return {
    cart,
    loading,
    error,
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    isInCart,
    getItemQuantity,
  };
}

export default useCart;
