import express from "express";
import {
  createDelivery,
  getDeliveries,
  getDeliveryById,
  updateDeliveryStatus,
  rateDelivery,
} from "../controllers/delivery.controllers.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

// Tạo delivery mới
router.post("/create", isAuth, createDelivery);

// Lấy deliveries
router.get("/", isAuth, getDeliveries);

// Lấy delivery theo ID
router.get("/:deliveryId", isAuth, getDeliveryById);

// Cập nhật trạng thái delivery
router.put("/:deliveryId/status", isAuth, updateDeliveryStatus);

// Đánh giá delivery
router.post("/:deliveryId/rate", isAuth, rateDelivery);

export default router;
