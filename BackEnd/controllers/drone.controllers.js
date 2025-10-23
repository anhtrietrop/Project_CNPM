import Drone from "../models/drone.model.js";
import Shop from "../models/shop.model.js";

// Tạo drone mới
export const createDrone = async (req, res) => {
  try {
    const {
      shopId,
      model,
      serialNumber,
      capacity,
      specifications,
    } = req.body;

    // Kiểm tra shop tồn tại
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy cửa hàng",
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
      shop: shopId,
      model,
      serialNumber,
      capacity,
      specifications,
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

// Lấy drone theo ID
export const getDroneById = async (req, res) => {
  try {
    const { droneId } = req.params;

    const drone = await Drone.findById(droneId)
      .populate("shop", "name city address");

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
    if (updateData.serialNumber && updateData.serialNumber !== drone.serialNumber) {
      const existingDrone = await Drone.findOne({ 
        serialNumber: updateData.serialNumber,
        _id: { $ne: droneId }
      });
      if (existingDrone) {
        return res.status(400).json({
          success: false,
          message: "Serial number đã tồn tại",
        });
      }
    }

    const updatedDrone = await Drone.findByIdAndUpdate(
      droneId,
      updateData,
      { new: true, runValidators: true }
    );

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
        battery: { ...drone.battery, current: battery || drone.battery.current },
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

    if (drone.status === "busy") {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa drone đang hoạt động",
      });
    }

    // Soft delete
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
