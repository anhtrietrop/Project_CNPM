import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [
      {
        orderItemId: {
          type: mongoose.Schema.Types.ObjectId,
          default: () => new mongoose.Types.ObjectId(),
        },
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        note: {
          type: String,
          default: "",
        },
        price: {
          type: Number,
          required: true,
        },
        subtotal: {
          type: Number,
          required: true,
        },
        // Embedded item data for performance
        itemName: {
          type: String,
          required: true,
        },
        itemImage: {
          type: String,
          required: true,
        },
        itemCategory: {
          type: String,
          required: true,
        },
        itemFoodType: {
          type: String,
          required: true,
        },
        // Embedded shop data for performance
        shopId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Shop",
          required: true,
        },
        shopName: {
          type: String,
          required: true,
        },
        shopCity: {
          type: String,
          required: true,
        },
        shopState: {
          type: String,
          required: true,
        },
        shopAddress: {
          type: String,
          required: true,
        },
        shopOwnerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    deliveryAddress: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      coordinates: {
        lat: {
          type: Number,
          required: true,
        },
        lng: {
          type: Number,
          required: true,
        },
      },
      note: {
        type: String,
        default: "",
      },
    },
    contactInfo: {
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      email: {
        type: String,
      },
    },
    paymentMethod: {
      type: String,
      enum: ["vnpay", "cash", "card"], // Cho phép các giá trị cũ để tương thích với orders đã tồn tại
      default: "vnpay",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    transactionId: {
      type: String,
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "delivering",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
    drone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Drone",
    },
    droneBatteryPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },
    estimatedDeliveryTime: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    cancelReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware để tính subtotal và totalAmount trước khi save
orderSchema.pre("save", function (next) {
  if (this.orderItems && this.orderItems.length > 0) {
    // Tính subtotal cho từng item
    this.orderItems.forEach((item) => {
      item.subtotal = item.price * item.quantity;
    });

    // Tính totalAmount
    this.totalAmount = this.orderItems.reduce(
      (total, item) => total + item.subtotal,
      0
    );
  }
  next();
});

// Index để tìm kiếm nhanh
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ "orderItems.shopOwnerId": 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
