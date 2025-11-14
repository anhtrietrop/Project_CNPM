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
  verifyConfirmCode,
  getOrderByDroneId,
} from "../controllers/order.controllers.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

// Public route - Get order by drone ID (for DroneSimulator)
router.get("/drone/:droneId", getOrderByDroneId);

// Tất cả routes đều cần authentication
router.use(isAuth);

// Shop owner routes - Phải đặt trước các routes có :orderId parameter
router.get("/shop/my-orders", isAuth, getShopOrders);
router.get("/shop/:orderId", isAuth, getShopOrderById);
router.put("/shop/:orderId/status", isAuth, updateShopOrderStatus);
router.get("/shop/:orderId/available-drones", isAuth, getAvailableDrones);
router.post("/shop/:orderId/assign-drone", isAuth, assignDroneToOrder);
router.put("/shop/:orderId/drone-battery", isAuth, updateDroneBattery);

// Tạo đơn hàng mới
router.post("/", createOrder);

// Lấy tất cả đơn hàng của user
router.get("/", getUserOrders);

// Lấy chi tiết đơn hàng
router.get("/:orderId", getOrderById);

// Hủy đơn hàng
router.put("/:orderId/cancel", cancelOrder);

// Verify confirmation code and complete order
router.post("/:orderId/verify-code", verifyConfirmCode);

// Cập nhật trạng thái đơn hàng (cho shop owner/admin)
router.put("/:orderId/status", updateOrderStatus);

export default router;
