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
      required: false, // Không bắt buộc vì order chỉ tạo sau khi thanh toán thành công
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["vnpay", "momo", "zalopay", "cod", "bank_transfer"],
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
    metadata: {
      type: mongoose.Schema.Types.Mixed, // Lưu thông tin order tạm thời
      default: {},
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
