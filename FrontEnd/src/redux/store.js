import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice.js";
import ownerSlice from "./ownerSlice.js";
import cartSlice from "./cartSlice.js";

export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    owner: ownerSlice.reducer,
    cart: cartSlice.reducer,
  },
  // Redux DevTools tự động enabled trong development
  // devTools: process.env.NODE_ENV !== 'production' // (mặc định)
});
