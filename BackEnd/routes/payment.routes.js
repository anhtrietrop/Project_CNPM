import express from "express";
import {
  createPayment,
  getUserPayments,
  getPaymentById,
  updatePaymentStatus,
  refundPayment,
} from "../controllers/payment.controllers.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

// Tạo payment mới
router.post("/create", isAuth, createPayment);

// Lấy payments của user
router.get("/my-payments", isAuth, getUserPayments);

// Lấy payment theo ID
router.get("/:paymentId", isAuth, getPaymentById);

// Cập nhật trạng thái payment
router.put("/:paymentId/status", isAuth, updatePaymentStatus);

// Hoàn tiền
router.post("/:paymentId/refund", isAuth, refundPayment);

export default router;
