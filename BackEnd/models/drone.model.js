import mongoose from "mongoose";

const droneSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    serialNumber: {
      type: String,
      required: true,
      unique: true,
    },
    capacity: {
      weight: {
        type: Number, // kg
        required: true,
      },
      volume: {
        type: Number, // cm³
        required: true,
      },
    },
    battery: {
      current: {
        type: Number,
        min: 0,
        max: 100,
        default: 100,
      },
      maxCapacity: {
        type: Number, // mAh
        required: true,
      },
    },
    status: {
      type: String,
      enum: ["available", "busy", "maintenance", "offline", "retired"],
      default: "available",
    },
    specifications: {
      maxSpeed: {
        type: Number, // km/h
        required: true,
      },
      maxAltitude: {
        type: Number, // meters
        required: true,
      },
      flightTime: {
        type: Number, // minutes
        required: true,
      },
      range: {
        type: Number, // km
        required: true,
      },
    },
    currentLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
    },
    maintenance: {
      lastService: {
        type: Date,
      },
      nextService: {
        type: Date,
      },
      serviceHistory: [
        {
          date: Date,
          description: String,
          cost: Number,
        },
      ],
    },
    flightStats: {
      totalFlights: {
        type: Number,
        default: 0,
      },
      totalDistance: {
        type: Number,
        default: 0,
      },
      totalFlightTime: {
        type: Number,
        default: 0,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index để tìm kiếm nhanh
droneSchema.index({ shop: 1 });
droneSchema.index({ status: 1 });
droneSchema.index({ serialNumber: 1 });

const Drone = mongoose.model("Drone", droneSchema);

export default Drone;
