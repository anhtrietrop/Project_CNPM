import express from "express";
import {
  createDrone,
  getShopDrones,
  getDroneById,
  updateDrone,
  updateDroneLocation,
  updateDroneStatus,
  deleteDrone,
} from "../controllers/drone.controllers.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

// Tạo drone mới
router.post("/create", isAuth, createDrone);

// Lấy drones của shop
router.get("/shop/:shopId", isAuth, getShopDrones);

// Lấy drone theo ID
router.get("/:droneId", isAuth, getDroneById);

// Cập nhật drone
router.put("/:droneId", isAuth, updateDrone);

// Cập nhật vị trí drone
router.put("/:droneId/location", isAuth, updateDroneLocation);

// Cập nhật trạng thái drone
router.put("/:droneId/status", isAuth, updateDroneStatus);

// Xóa drone
router.delete("/:droneId", isAuth, deleteDrone);

export default router;
