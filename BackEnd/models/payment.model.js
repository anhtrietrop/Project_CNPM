import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    method: {
      type: String,
      enum: ["cash", "card", "momo", "zalopay", "bank_transfer"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "refunded"],
      default: "pending",
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true, // Cho phép null/undefined nhưng unique khi có giá trị
    },
    paymentDetails: {
      cardNumber: {
        type: String,
        select: false, // Không trả về trong query mặc định
      },
      bankCode: String,
      momoAccount: String,
      // Thêm các field khác tùy theo phương thức thanh toán
    },
    processedAt: {
      type: Date,
    },
    failedReason: {
      type: String,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Index để tìm kiếm nhanh
paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
