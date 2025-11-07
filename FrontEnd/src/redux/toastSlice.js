import { createSlice } from "@reduxjs/toolkit";

const toastSlice = createSlice({
  name: "toast",
  initialState: {
    toasts: [], // Array of { id, message, type, duration }
  },
  reducers: {
    showToast: (state, action) => {
      const { message, type = "success", duration = 3000 } = action.payload;
      const id = Date.now() + Math.random(); // Unique ID
      state.toasts.push({
        id,
        message,
        type,
        duration,
      });
    },
    hideToast: (state, action) => {
      state.toasts = state.toasts.filter(
        (toast) => toast.id !== action.payload
      );
    },
    clearAllToasts: (state) => {
      state.toasts = [];
    },
  },
});

export const { showToast, hideToast, clearAllToasts } = toastSlice.actions;

export default toastSlice.reducer;
