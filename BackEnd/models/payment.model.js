import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true, // ✅ Bắt buộc - mỗi payment phải có order
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["vnpay"],
      default: "vnpay",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded", "cancelled"],
      default: "pending",
    },
    transactionId: {
      type: String,
      default: "",
    },
    bankCode: {
      type: String,
      default: "",
    },
    payDate: {
      type: String,
      default: "",
    },
    failureReason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Index cho tìm kiếm nhanh
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ order: 1 });
paymentSchema.index({ transactionId: 1 });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
