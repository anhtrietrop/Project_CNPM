import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import axios from "axios";
import { serverURL } from "../App.jsx";
import {
  addToCart as addToCartAction,
  updateCartItem as updateCartItemAction,
  removeFromCart as removeFromCartAction,
  clearCart as clearCartAction,
  setCart,
} from "../redux/cartSlice.js";

function useCart() {
  // Lấy cart từ Redux store
  const cart = useSelector((state) => state.cart);
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cart từ backend khi component mount (chỉ khi đã đăng nhập)
  useEffect(() => {
    if (userData) {
      fetchCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  // Fetch cart từ backend
  const fetchCart = async () => {
    if (!userData) {
      // Nếu chưa đăng nhập, set cart rỗng
      dispatch(setCart({ cartItems: [], totalAmount: 0 }));
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${serverURL}/api/cart/my-cart`, {
        withCredentials: true,
      });
      dispatch(setCart(response.data));
    } catch (error) {
      // Không log lỗi 401/400 (chưa đăng nhập là bình thường)
      if (error.response?.status !== 401 && error.response?.status !== 400) {
        console.error("Error fetching cart:", error);
      }
      // Nếu không có cart, tạo cart rỗng
      dispatch(setCart({ cartItems: [], totalAmount: 0 }));
    } finally {
      setLoading(false);
    }
  };

  // Lấy giỏ hàng
  const getCart = () => {
    return cart;
  };

  // Thêm vào giỏ hàng
  const addToCart = async (itemId, quantity = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${serverURL}/api/cart/add`,
        { itemId, quantity },
        { withCredentials: true }
      );

      // Cập nhật Redux store với data từ backend
      dispatch(setCart(response.data));
      return response.data;
    } catch (err) {
      setError(err.message || "Failed to add to cart");
      console.error("Add to cart error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Thêm vào giỏ hàng với full item data
  const addItemToCart = async (item, quantity = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${serverURL}/api/cart/add`,
        { itemId: item._id, quantity },
        { withCredentials: true }
      );

      // Cập nhật Redux store với data từ backend
      dispatch(setCart(response.data));
      return response.data;
    } catch (err) {
      setError(err.message || "Failed to add to cart");
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
      setError(null);

      const response = await axios.put(
        `${serverURL}/api/cart/update/${itemId}`,
        { quantity },
        { withCredentials: true }
      );

      // Cập nhật Redux store với data từ backend
      dispatch(setCart(response.data));
      return response.data;
    } catch (err) {
      setError(err.message || "Failed to update cart item");
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
      setError(null);

      const response = await axios.delete(
        `${serverURL}/api/cart/remove/${itemId}`,
        { withCredentials: true }
      );

      // Cập nhật Redux store với data từ backend
      dispatch(setCart(response.data));
      return response.data;
    } catch (err) {
      setError(err.message || "Failed to remove from cart");
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
      setError(null);

      const response = await axios.delete(`${serverURL}/api/cart/clear`, {
        withCredentials: true,
      });

      // Cập nhật Redux store với data từ backend
      dispatch(setCart(response.data));
      return response.data;
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
    const items = cart?.cartItems || cart?.items || [];
    return items.some((cartItem) => cartItem.itemId === itemId);
  };

  // Lấy quantity của item trong cart
  const getItemQuantity = (itemId) => {
    const items = cart?.cartItems || cart?.items || [];
    const cartItem = items.find((cartItem) => cartItem.itemId === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  // Lấy tổng giá trị cart
  const getTotalPrice = () => {
    const items = cart?.cartItems || cart?.items || [];
    return items.reduce(
      (total, cartItem) =>
        total + (cartItem.subtotal || cartItem.price * cartItem.quantity),
      0
    );
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
    getTotalPrice,
  };
}

export default useCart;
