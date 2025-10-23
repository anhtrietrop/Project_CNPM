import { createSlice } from "@reduxjs/toolkit";

// Load cart từ localStorage khi khởi tạo
const loadCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      return JSON.parse(savedCart);
    }
  } catch (error) {
    console.error("Error loading cart from localStorage:", error);
  }
  return {
    items: [],
    totalAmount: 0,
  };
};

// Save cart vào localStorage
const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem("cart", JSON.stringify(cart));
  } catch (error) {
    console.error("Error saving cart to localStorage:", error);
  }
};

// Tính tổng tiền
const calculateTotal = (items) => {
  return items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
};

const initialState = loadCartFromStorage();

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Thêm item vào cart
    addToCart: (state, action) => {
      const { item, quantity = 1 } = action.payload;

      // Kiểm tra item đã có trong cart chưa
      const existingItemIndex = state.items.findIndex(
        (cartItem) => cartItem.item._id === item._id
      );

      if (existingItemIndex > -1) {
        // Nếu đã có, tăng quantity
        state.items[existingItemIndex].quantity += quantity;
      } else {
        // Nếu chưa có, thêm mới
        state.items.push({
          item: item,
          quantity: quantity,
          price: item.price,
        });
      }

      // Cập nhật tổng tiền
      state.totalAmount = calculateTotal(state.items);

      // Lưu vào localStorage
      saveCartToStorage(state);
    },

    // Cập nhật quantity của item
    updateCartItem: (state, action) => {
      const { itemId, quantity } = action.payload;

      const itemIndex = state.items.findIndex(
        (cartItem) => cartItem.item._id === itemId
      );

      if (itemIndex > -1) {
        if (quantity < 1) {
          // Nếu quantity < 1, xóa item
          state.items.splice(itemIndex, 1);
        } else {
          // Cập nhật quantity
          state.items[itemIndex].quantity = quantity;
        }

        // Cập nhật tổng tiền
        state.totalAmount = calculateTotal(state.items);

        // Lưu vào localStorage
        saveCartToStorage(state);
      }
    },

    // Xóa item khỏi cart
    removeFromCart: (state, action) => {
      const itemId = action.payload;

      state.items = state.items.filter(
        (cartItem) => cartItem.item._id !== itemId
      );

      // Cập nhật tổng tiền
      state.totalAmount = calculateTotal(state.items);

      // Lưu vào localStorage
      saveCartToStorage(state);
    },

    // Xóa toàn bộ cart
    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;

      // Lưu vào localStorage
      saveCartToStorage(state);
    },

    // Load cart từ localStorage (dùng khi cần refresh)
    loadCart: (state) => {
      const savedCart = loadCartFromStorage();
      state.items = savedCart.items;
      state.totalAmount = savedCart.totalAmount;
    },

    // Set cart từ backend
    setCart: (state, action) => {
      // Handle both old and new structure
      if (action.payload.cartItems) {
        state.cartItems = action.payload.cartItems;
      } else if (action.payload.items) {
        // Migrate from old structure
        state.cartItems = action.payload.items.map(item => ({
          cartItemId: item.cartItemId || new Date().getTime(),
          itemId: item.itemId || item.item._id,
          quantity: item.quantity,
          note: item.note || "",
          addedAt: item.addedAt || new Date(),
          itemName: item.itemName || item.item.name,
          itemImage: item.itemImage || item.item.image,
          itemCategory: item.itemCategory || item.item.category,
          itemFoodType: item.itemFoodType || item.item.foodType,
          price: item.price,
          subtotal: item.subtotal || (item.price * item.quantity),
          shopId: item.shopId || item.shop._id,
          shopName: item.shopName || item.shop.name,
          shopCity: item.shopCity || item.shop.city,
          shopState: item.shopState || item.shop.state,
          shopAddress: item.shopAddress || item.shop.address,
        }));
      } else {
        state.cartItems = [];
      }
      state.totalAmount = action.payload.totalAmount || 0;
    },
  },
});

export const {
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  loadCart,
  setCart,
} = cartSlice.actions;

export default cartSlice;
