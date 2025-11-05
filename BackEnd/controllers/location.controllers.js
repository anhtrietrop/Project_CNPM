import Location from "../models/location.model.js";
import Drone from "../models/drone.model.js";

// Ghi lại vị trí drone
export const recordLocation = async (req, res) => {
  try {
    const {
      droneId,
      latitude,
      longitude,
      altitude,
      speed,
      heading,
      accuracy,
      batteryLevel,
      signalStrength,
      weather,
    } = req.body;

    // Kiểm tra drone tồn tại
    const drone = await Drone.findById(droneId);
    if (!drone) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy drone",
      });
    }

    const location = new Location({
      drone: droneId,
      latitude,
      longitude,
      altitude,
      speed,
      heading,
      accuracy,
      batteryLevel,
      signalStrength,
      weather,
    });

    await location.save();

    // Cập nhật vị trí hiện tại của drone
    await Drone.findByIdAndUpdate(droneId, {
      currentLocation: {
        latitude,
        longitude,
        altitude,
        lastUpdated: new Date(),
      },
    });

    res.status(201).json({
      success: true,
      message: "Vị trí được ghi lại thành công",
      data: location,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Lấy lịch sử vị trí của drone
export const getDroneLocationHistory = async (req, res) => {
  try {
    const { droneId } = req.params;
    const { page = 1, limit = 50, startDate, endDate } = req.query;

    const query = { drone: droneId, isActive: true };
    
    if (startDate || endDate) {
      query.recordedAt = {};
      if (startDate) query.recordedAt.$gte = new Date(startDate);
      if (endDate) query.recordedAt.$lte = new Date(endDate);
    }

    const locations = await Location.find(query)
      .populate("drone", "model serialNumber")
      .sort({ recordedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Location.countDocuments(query);

    res.status(200).json({
      success: true,
      data: locations,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Lấy vị trí hiện tại của drone
export const getCurrentDroneLocation = async (req, res) => {
  try {
    const { droneId } = req.params;

    const drone = await Drone.findById(droneId)
      .select("currentLocation model serialNumber status");

    if (!drone) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy drone",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        drone: {
          _id: drone._id,
          model: drone.model,
          serialNumber: drone.serialNumber,
          status: drone.status,
        },
        currentLocation: drone.currentLocation,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Lấy vị trí của tất cả drone trong khu vực
export const getDronesInArea = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query; // radius in km

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Cần cung cấp latitude và longitude",
      });
    }

    // Tìm drone trong bán kính
    const drones = await Drone.find({
      "currentLocation.latitude": {
        $gte: parseFloat(latitude) - (radius / 111), // 1 degree ≈ 111 km
        $lte: parseFloat(latitude) + (radius / 111),
      },
      "currentLocation.longitude": {
        $gte: parseFloat(longitude) - (radius / 111),
        $lte: parseFloat(longitude) + (radius / 111),
      },
      status: { $in: ["available", "busy"] },
      isActive: true,
    })
      .select("model serialNumber currentLocation status battery")
      .populate("shop", "name city");

    res.status(200).json({
      success: true,
      data: drones,
      count: drones.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Lấy thống kê vị trí
export const getLocationStats = async (req, res) => {
  try {
    const { droneId } = req.params;
    const { startDate, endDate } = req.query;

    const query = { drone: droneId, isActive: true };
    
    if (startDate || endDate) {
      query.recordedAt = {};
      if (startDate) query.recordedAt.$gte = new Date(startDate);
      if (endDate) query.recordedAt.$lte = new Date(endDate);
    }

    const stats = await Location.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          avgSpeed: { $avg: "$speed" },
          maxSpeed: { $max: "$speed" },
          avgBattery: { $avg: "$batteryLevel" },
          minBattery: { $min: "$batteryLevel" },
          avgSignal: { $avg: "$signalStrength" },
          totalDistance: {
            $sum: {
              $multiply: ["$speed", 0.0167] // Convert km/h to km per minute
            }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalRecords: 0,
        avgSpeed: 0,
        maxSpeed: 0,
        avgBattery: 0,
        minBattery: 0,
        avgSignal: 0,
        totalDistance: 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

