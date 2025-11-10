import { createSlice } from "@reduxjs/toolkit";

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    adminData: null,
    isAuthenticated: false,
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
  },
});

export const { setAdminData, clearAdminData, logoutAdmin } = adminSlice.actions;
export default adminSlice.reducer;
