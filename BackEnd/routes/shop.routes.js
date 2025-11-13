import express from "express";
import {
  createEditShop,
  getMyShop,
  getShopByCity,
  updateCategories,
} from "../controllers/shop.controllers.js";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";
const shopRouter = express.Router();

shopRouter.post(
  "/create-edit",
  isAuth,
  upload.fields([
    { name: "image", maxCount: 1 }, // Logo shop
    { name: "representativeIdCard", maxCount: 1 }, // CCCD
    { name: "menuImages", maxCount: 5 }, // Menu (tối đa 5 ảnh)
  ]),
  createEditShop
);

shopRouter.get("/get-my", isAuth, getMyShop);
shopRouter.get("/get-by-city/:city", getShopByCity); // Bỏ isAuth để guest có thể xem
shopRouter.put("/update-categories", isAuth, updateCategories);
export default shopRouter;
