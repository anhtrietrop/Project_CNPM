import Delivery from "../models/delivery.model.js";
import Order from "../models/order.model.js";
import Drone from "../models/drone.model.js";

// Tạo delivery mới
export const createDelivery = async (req, res) => {
  try {
    const { orderId, droneId, deliveryBoyId, startLocation, endLocation } = req.body;

    // Kiểm tra order tồn tại
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    // Kiểm tra drone có sẵn sàng
    const drone = await Drone.findById(droneId);
    if (!drone || drone.status !== "available") {
      return res.status(400).json({
        success: false,
        message: "Drone không khả dụng",
      });
    }

    // Kiểm tra delivery đã tồn tại cho order này
    const existingDelivery = await Delivery.findOne({ order: orderId });
    if (existingDelivery) {
      return res.status(400).json({
        success: false,
        message: "Đơn hàng đã có giao hàng",
      });
    }

    const delivery = new Delivery({
      order: orderId,
      drone: droneId,
      deliveryBoy: deliveryBoyId,
      startLocation,
      endLocation,
    });

    await delivery.save();

    // Cập nhật trạng thái drone
    await Drone.findByIdAndUpdate(droneId, { status: "busy" });

    // Cập nhật trạng thái order
    await Order.findByIdAndUpdate(orderId, { orderStatus: "delivering" });

    res.status(201).json({
      success: true,
      message: "Giao hàng được tạo thành công",
      data: delivery,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Lấy deliveries
export const getDeliveries = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, droneId } = req.query;

    const query = {};
    if (status) query.status = status;
    if (droneId) query.drone = droneId;

    const deliveries = await Delivery.find(query)
      .populate("order", "orderStatus totalAmount user")
      .populate("drone", "model serialNumber")
      .populate("deliveryBoy", "fullName phone")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Delivery.countDocuments(query);

    res.status(200).json({
      success: true,
      data: deliveries,
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

// Lấy delivery theo ID
export const getDeliveryById = async (req, res) => {
  try {
    const { deliveryId } = req.params;

    const delivery = await Delivery.findById(deliveryId)
      .populate("order", "orderStatus totalAmount user items")
      .populate("drone", "model serialNumber currentLocation")
      .populate("deliveryBoy", "fullName phone");

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giao hàng",
      });
    }

    res.status(200).json({
      success: true,
      data: delivery,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Cập nhật trạng thái delivery
export const updateDeliveryStatus = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { status, deliveryNotes, customerSignature, deliveryProof } = req.body;

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giao hàng",
      });
    }

    const updateData = { status };
    if (deliveryNotes) updateData.deliveryNotes = deliveryNotes;
    if (customerSignature) updateData.customerSignature = customerSignature;
    if (deliveryProof) updateData.deliveryProof = deliveryProof;
    if (status === "delivered") updateData.actualDeliveryTime = new Date();

    const updatedDelivery = await Delivery.findByIdAndUpdate(
      deliveryId,
      updateData,
      { new: true, runValidators: true }
    );

    // Cập nhật trạng thái order và drone
    if (status === "delivered") {
      await Order.findByIdAndUpdate(delivery.order, { orderStatus: "completed" });
      await Drone.findByIdAndUpdate(delivery.drone, { status: "available" });
    } else if (status === "failed") {
      await Drone.findByIdAndUpdate(delivery.drone, { status: "available" });
    }

    res.status(200).json({
      success: true,
      message: "Trạng thái giao hàng được cập nhật thành công",
      data: updatedDelivery,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Đánh giá delivery
export const rateDelivery = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { rating, feedback } = req.body;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Đánh giá phải từ 1 đến 5 sao",
      });
    }

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giao hàng",
      });
    }

    if (delivery.status !== "delivered") {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể đánh giá giao hàng đã hoàn thành",
      });
    }

    const updatedDelivery = await Delivery.findByIdAndUpdate(
      deliveryId,
      { rating, feedback },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Đánh giá giao hàng thành công",
      data: updatedDelivery,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

