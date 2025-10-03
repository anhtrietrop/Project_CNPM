import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice.js";
import ownerSlice from "./ownerSlice.js";
export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    owner: ownerSlice.reducer,
  },
  // Redux DevTools tự động enabled trong development
  // devTools: process.env.NODE_ENV !== 'production' // (mặc định)
});
