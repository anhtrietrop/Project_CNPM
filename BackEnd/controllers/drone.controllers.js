import Drone from "../models/drone.model.js";
import Shop from "../models/shop.model.js";

// Tạo drone mới
export const createDrone = async (req, res) => {
  try {
    const { model, serialNumber } = req.body;

    // Tìm shop của user hiện tại
    const shop = await Shop.findOne({ owner: req.userId });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy cửa hàng của bạn",
      });
    }

    // Kiểm tra shop đã được duyệt chưa
    if (!shop.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Nhà hàng của bạn chưa được Admin duyệt. Vui lòng chờ!",
      });
    }

    // Kiểm tra serial number trùng lặp
    const existingDrone = await Drone.findOne({ serialNumber });
    if (existingDrone) {
      return res.status(400).json({
        success: false,
        message: "Serial number đã tồn tại",
      });
    }

    const drone = new Drone({
      shop: shop._id,
      model,
      serialNumber,
      capacity: {
        weight: 5,
        volume: 50000,
      },
      specifications: {
        maxSpeed: 60,
        maxAltitude: 500,
        flightTime: 30,
        range: 15,
      },
      battery: {
        current: 100,
        maxCapacity: 5000,
      },
    });

    await drone.save();

    res.status(201).json({
      success: true,
      message: "Drone được tạo thành công",
      data: drone,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Lấy drones của shop
export const getShopDrones = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const query = { shop: shopId, isActive: true };
    if (status) query.status = status;

    const drones = await Drone.find(query)
      .populate("shop", "name city")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Drone.countDocuments(query);

    res.status(200).json({
      success: true,
      data: drones,
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

// Lấy drones của shop owner hiện tại
export const getMyShopDrones = async (req, res) => {
  try {
    const { status } = req.query;

    // Tìm shop của user hiện tại
    const shop = await Shop.findOne({ owner: req.userId });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy shop của bạn",
      });
    }

    const query = { shop: shop._id, isActive: true };
    if (status) query.status = status;

    const drones = await Drone.find(query)
      .populate("shop", "name city")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: drones,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Lấy drone theo ID
export const getDroneById = async (req, res) => {
  try {
    const { droneId } = req.params;

    const drone = await Drone.findById(droneId).populate(
      "shop",
      "name city address"
    );

    if (!drone) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy drone",
      });
    }

    res.status(200).json({
      success: true,
      data: drone,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Cập nhật drone
export const updateDrone = async (req, res) => {
  try {
    const { droneId } = req.params;
    const updateData = req.body;

    const drone = await Drone.findById(droneId);
    if (!drone) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy drone",
      });
    }

    // Kiểm tra serial number trùng lặp (nếu có thay đổi)
    if (
      updateData.serialNumber &&
      updateData.serialNumber !== drone.serialNumber
    ) {
      const existingDrone = await Drone.findOne({
        serialNumber: updateData.serialNumber,
        _id: { $ne: droneId },
      });
      if (existingDrone) {
        return res.status(400).json({
          success: false,
          message: "Serial number đã tồn tại",
        });
      }
    }

    const updatedDrone = await Drone.findByIdAndUpdate(droneId, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Drone được cập nhật thành công",
      data: updatedDrone,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Cập nhật vị trí drone
export const updateDroneLocation = async (req, res) => {
  try {
    const { droneId } = req.params;
    const { latitude, longitude, altitude, battery, speed, heading } = req.body;

    const drone = await Drone.findById(droneId);
    if (!drone) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy drone",
      });
    }

    const updatedDrone = await Drone.findByIdAndUpdate(
      droneId,
      {
        currentLocation: {
          latitude,
          longitude,
          altitude,
          lastUpdated: new Date(),
        },
        battery: {
          ...drone.battery,
          current: battery || drone.battery.current,
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Vị trí drone được cập nhật thành công",
      data: updatedDrone,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Cập nhật trạng thái drone
export const updateDroneStatus = async (req, res) => {
  try {
    const { droneId } = req.params;
    const { status } = req.body;

    const drone = await Drone.findById(droneId);
    if (!drone) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy drone",
      });
    }

    const updatedDrone = await Drone.findByIdAndUpdate(
      droneId,
      { status },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Trạng thái drone được cập nhật thành công",
      data: updatedDrone,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Xóa drone (soft delete)
export const deleteDrone = async (req, res) => {
  try {
    const { droneId } = req.params;

    const drone = await Drone.findById(droneId);
    if (!drone) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy drone",
      });
    }

    // Kiểm tra quyền: phải là shop owner
    const shop = await Shop.findOne({ _id: drone.shop, owner: req.userId });
    if (!shop) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa drone này",
      });
    }

    // Soft delete - không kiểm tra status busy nữa
    await Drone.findByIdAndUpdate(droneId, { isActive: false });

    res.status(200).json({
      success: true,
      message: "Drone đã được xóa thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Cập nhật battery của drone
export const updateDroneBattery = async (req, res) => {
  try {
    const { droneId } = req.params;
    const { batteryPercentage } = req.body;

    // Validation
    if (batteryPercentage === undefined || batteryPercentage === null) {
      return res.status(400).json({
        success: false,
        message: "Battery percentage is required",
      });
    }

    if (batteryPercentage < 0 || batteryPercentage > 100) {
      return res.status(400).json({
        success: false,
        message: "Battery percentage must be between 0 and 100",
      });
    }

    const drone = await Drone.findById(droneId);
    if (!drone) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy drone",
      });
    }

    // Kiểm tra quyền: phải là shop owner của drone
    const shop = await Shop.findOne({ _id: drone.shop, owner: req.userId });
    if (!shop) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền cập nhật drone này",
      });
    }

    // Cập nhật battery
    drone.battery.current = Number(batteryPercentage);
    await drone.save();

    res.status(200).json({
      success: true,
      message: "Cập nhật pin drone thành công",
      data: drone,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};
