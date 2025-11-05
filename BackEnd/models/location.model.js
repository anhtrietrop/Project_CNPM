import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    drone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Drone",
      required: true,
    },
    latitude: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    longitude: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    altitude: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0,
    },
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
    recordedAt: {
      type: Date,
      default: Date.now,
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
    weather: {
      temperature: Number, // Celsius
      humidity: Number, // Percentage
      windSpeed: Number, // km/h
      windDirection: Number, // degrees
      visibility: Number, // km
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index để tìm kiếm nhanh
locationSchema.index({ drone: 1, recordedAt: -1 });
locationSchema.index({ recordedAt: -1 });
locationSchema.index({ 
  latitude: 1, 
  longitude: 1, 
  recordedAt: -1 
});

// Compound index cho geospatial queries
locationSchema.index({ 
  "latitude": "2dsphere", 
  "longitude": "2dsphere" 
});

const Location = mongoose.model("Location", locationSchema);

export default Location;

