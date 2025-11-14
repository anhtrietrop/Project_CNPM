import { createSlice } from "@reduxjs/toolkit";

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    adminData: null,
    isAuthenticated: false,
    toasts: [],
  },
  reducers: {
    setAdminData: (state, action) => {
      state.adminData = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearAdminData: (state) => {
      state.adminData = null;
      state.isAuthenticated = false;
    },
    logoutAdmin: (state) => {
      state.adminData = null;
      state.isAuthenticated = false;
    },
    addToast: (state, action) => {
      state.toasts.push(action.payload);
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(
        (toast) => toast.id !== action.payload
      );
    },
  },
});

export const {
  setAdminData,
  clearAdminData,
  logoutAdmin,
  addToast,
  removeToast,
} = adminSlice.actions;
export default adminSlice.reducer;
