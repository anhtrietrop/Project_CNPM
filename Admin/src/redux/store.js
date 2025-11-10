import { configureStore } from "@reduxjs/toolkit";
import adminReducer from "./adminSlice";

export const store = configureStore({
  reducer: {
    admin: adminReducer,
  },
});
