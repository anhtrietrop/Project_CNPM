import express from "express";
import {
  getRevenueByRestaurant,
  getRevenueByPeriod,
  getRestaurantList,
} from "../controllers/report.controllers.js";
import isAuth from "../middlewares/isAuth.js";

const reportRouter = express.Router();

// Lấy báo cáo doanh thu tất cả nhà hàng
reportRouter.get("/revenue/restaurants", isAuth, getRevenueByRestaurant);

// Lấy báo cáo doanh thu theo thời gian (cho tất cả hoặc một nhà hàng)
reportRouter.get("/revenue/period/:shopId", isAuth, getRevenueByPeriod);
reportRouter.get("/revenue/period", isAuth, getRevenueByPeriod);

// Lấy danh sách nhà hàng
reportRouter.get("/restaurants", isAuth, getRestaurantList);

export default reportRouter;
