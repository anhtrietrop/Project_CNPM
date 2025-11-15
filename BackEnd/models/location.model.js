import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    // Thông tin địa lý cơ bản
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    altitude: {
      type: Number,
      default: 0,
    },
    // Loại location (shop, delivery, drone)
    type: {
      type: String,
      enum: ["shop", "delivery", "drone_tracking"],
      required: true,
    },
    // Reference đến entity sử dụng location này
    refModel: {
      type: String,
      enum: ["Shop", "Order", "Drone"],
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    // Thông tin bổ sung cho drone tracking
    speed: {
      type: Number, // km/h
      default: 0,
    },
    heading: {
      type: Number, // degrees (0-360)
      default: 0,
    },
    accuracy: {
      type: Number, // meters
      default: 0,
    },
    batteryLevel: {
      type: Number,
      min: 0,
      max: 100,
    },
    signalStrength: {
      type: Number,
      min: 0,
      max: 100,
    },
    // Ghi chú bổ sung
    note: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index để tìm kiếm nhanh
locationSchema.index({ refModel: 1, refId: 1 });
locationSchema.index({ type: 1 });
locationSchema.index({ latitude: 1, longitude: 1 });
locationSchema.index({ city: 1 });

const Location = mongoose.model("Location", locationSchema);

export default Location;
