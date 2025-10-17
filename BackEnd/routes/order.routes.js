import express from "express";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
} from "../controllers/order.controllers.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(isAuth);

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
