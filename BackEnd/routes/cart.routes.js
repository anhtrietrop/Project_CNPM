import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cart.controllers.js";

const cartRouter = express.Router();

cartRouter.get("/my-cart", isAuth, getCart);
cartRouter.post("/add", isAuth, addToCart);
cartRouter.put("/update/:itemId", isAuth, updateCartItem);
cartRouter.delete("/remove/:itemId", isAuth, removeFromCart);
cartRouter.delete("/clear", isAuth, clearCart);

export default cartRouter;
