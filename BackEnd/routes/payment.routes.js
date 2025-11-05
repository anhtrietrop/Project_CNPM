import express from "express";
import {
  createPayment,
  getUserPayments,
  getPaymentById,
  updatePaymentStatus,
  refundPayment,
  createVNPayPaymentUrl,
  vnpayReturn,
} from "../controllers/payment.controllers.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

// VNPay routes
router.post("/vnpay/create-payment-url", isAuth, createVNPayPaymentUrl);

// ✅ CRITICAL: VNPay callback về backend, backend update order rồi redirect về frontend
router.get("/vnpay/return", vnpayReturn);

// Tạo payment thủ công
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
