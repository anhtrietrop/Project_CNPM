import express from "express";
import {
  createDrone,
  getShopDrones,
  getMyShopDrones,
  getDroneById,
  updateDrone,
  updateDroneLocation,
  updateDroneStatus,
  deleteDrone,
} from "../controllers/drone.controllers.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(isAuth);

// Lấy drones của shop owner hiện tại
router.get("/my-drones", getMyShopDrones);

// Tạo drone mới
router.post("/", createDrone);

// Lấy drones của shop
router.get("/shop/:shopId", getShopDrones);

// Lấy drone theo ID
router.get("/:droneId", getDroneById);

// Cập nhật drone
router.put("/:droneId", updateDrone);

// Cập nhật vị trí drone
router.put("/:droneId/location", updateDroneLocation);

// Cập nhật trạng thái drone
router.put("/:droneId/status", updateDroneStatus);

// Xóa drone
router.delete("/:droneId", deleteDrone);

export default router;
