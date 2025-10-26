import express from "express";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  getShopOrders,
  getShopOrderById,
  updateShopOrderStatus,
  getAvailableDrones,
  assignDroneToOrder,
  updateDroneBattery,
} from "../controllers/order.controllers.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(isAuth);

// Shop owner routes - Phải đặt trước các routes có :orderId parameter
router.get("/shop/my-orders", getShopOrders);
router.get("/shop/:orderId", getShopOrderById);
router.put("/shop/:orderId/status", updateShopOrderStatus);
router.get("/shop/:orderId/available-drones", getAvailableDrones);
router.post("/shop/:orderId/assign-drone", assignDroneToOrder);
router.put("/shop/:orderId/drone-battery", updateDroneBattery);

// Tạo đơn hàng mới
router.post("/", createOrder);

// Lấy tất cả đơn hàng của user
router.get("/", getUserOrders);

// Lấy chi tiết đơn hàng
router.get("/:orderId", getOrderById);

// Hủy đơn hàng
router.put("/:orderId/cancel", cancelOrder);

// Cập nhật trạng thái đơn hàng (cho shop owner/admin)
router.put("/:orderId/status", updateOrderStatus);

export default router;
