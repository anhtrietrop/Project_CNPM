import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    drone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Drone",
      required: true,
    },
    deliveryBoy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // Có thể null nếu chỉ dùng drone
    },
    startLocation: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
    },
    endLocation: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
    },
    status: {
      type: String,
      enum: [
        "assigned",
        "picked_up", 
        "in_transit",
        "delivered",
        "failed",
        "cancelled"
      ],
      default: "assigned",
    },
    estimatedDeliveryTime: {
      type: Date,
    },
    actualDeliveryTime: {
      type: Date,
    },
    distance: {
      type: Number, // Khoảng cách tính bằng km
    },
    deliveryNotes: {
      type: String,
    },
    customerSignature: {
      type: String, // Base64 encoded signature
    },
    deliveryProof: {
      type: String, // URL to delivery proof image
    },
    failedReason: {
      type: String,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedback: {
      type: String,
    },
  },
  { timestamps: true }
);

// Index để tìm kiếm nhanh
deliverySchema.index({ order: 1 });
deliverySchema.index({ drone: 1 });
deliverySchema.index({ status: 1 });
deliverySchema.index({ createdAt: -1 });

const Delivery = mongoose.model("Delivery", deliverySchema);

export default Delivery;

