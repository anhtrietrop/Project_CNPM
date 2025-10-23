import express from "express";
import {
  recordLocation,
  getDroneLocationHistory,
  getCurrentDroneLocation,
  getDronesInArea,
  getLocationStats,
} from "../controllers/location.controllers.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

// Ghi lại vị trí drone
router.post("/record", isAuth, recordLocation);

// Lấy lịch sử vị trí của drone
router.get("/drone/:droneId/history", isAuth, getDroneLocationHistory);

// Lấy vị trí hiện tại của drone
router.get("/drone/:droneId/current", isAuth, getCurrentDroneLocation);

// Lấy drone trong khu vực
router.get("/area", isAuth, getDronesInArea);

// Lấy thống kê vị trí
router.get("/drone/:droneId/stats", isAuth, getLocationStats);

export default router;
