import Order from "../models/order.model.js";
import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";
import Drone from "../models/drone.model.js";

// Tạo đơn hàng mới
export const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, deliveryAddress, contactInfo, paymentMethod } =
      req.body;

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (
      !deliveryAddress ||
      !deliveryAddress.address ||
      !deliveryAddress.coordinates
    ) {
      return res.status(400).json({ message: "Delivery address is required" });
    }

    if (!contactInfo || !contactInfo.name || !contactInfo.phone) {
      return res
        .status(400)
        .json({ message: "Contact information is required" });
    }

    // Validate phone number (10-11 digits)
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(contactInfo.phone)) {
      return res.status(400).json({
        message: "Phone number must be 10-11 digits",
      });
    }

    // Verify items và lấy thông tin đầy đủ cho embedded documents
    const orderItems = [];
    for (const cartItem of items) {
      // CartItem đã có embedded data, chỉ cần lấy shop owner
      const itemId = cartItem.itemId || cartItem.item?._id || cartItem.item;

      if (!itemId) {
        console.error("Invalid cart item:", cartItem);
        return res.status(400).json({
          message: "Invalid cart item data",
        });
      }

      // Lấy shop và owner info
      const shop = await Shop.findById(cartItem.shopId).populate("owner");
      if (!shop || !shop.owner) {
        console.error(`Shop owner not found for shop ${cartItem.shopId}`);
        return res.status(404).json({
          message: `Shop owner not found for item ${cartItem.itemName}`,
        });
      }

      orderItems.push({
        itemId: itemId,
        quantity: cartItem.quantity,
        price: cartItem.price,
        subtotal: cartItem.subtotal || cartItem.price * cartItem.quantity,
        note: cartItem.note || "",
        itemName: cartItem.itemName,
        itemImage: cartItem.itemImage,
        itemCategory: cartItem.itemCategory,
        itemFoodType: cartItem.itemFoodType,
        shopId: cartItem.shopId,
        shopName: cartItem.shopName,
        shopCity: cartItem.shopCity,
        shopState: cartItem.shopState,
        shopAddress: cartItem.shopAddress,
        shopOwnerId: shop.owner._id,
      });
    }

    // Tính estimated delivery time (30-45 phút)
    const estimatedDeliveryTime = new Date();
    estimatedDeliveryTime.setMinutes(estimatedDeliveryTime.getMinutes() + 35);

    // Tạo order với embedded deliveryAddress
    const order = await Order.create({
      user: req.userId,
      orderItems: orderItems,
      totalAmount,
      deliveryAddress,
      contactInfo,
      paymentMethod: paymentMethod || "cash",
      estimatedDeliveryTime,
    });

    // Populate chỉ thông tin user vì items đã embedded
    await order.populate({
      path: "user",
      select: "fullName email mobile",
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order, // Frontend expect data.data._id
    });
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({
      success: false,
      message: `Create order error: ${error.message}`,
    });
  }
};

// Lấy tất cả đơn hàng của user
export const getUserOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { user: req.userId };
    if (status) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .populate({
        path: "user",
        select: "fullName email mobile",
      })
      .populate({
        path: "payment",
        select: "paymentMethod status transactionId amount payDate",
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    return res.status(200).json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error("Get user orders error:", error);
    return res.status(500).json({
      message: `Get user orders error: ${error.message}`,
    });
  }
};

// Lấy chi tiết đơn hàng
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      user: req.userId,
    })
      .populate({
        path: "user",
        select: "fullName email mobile",
      })
      .populate({
        path: "payment",
        select: "paymentMethod status transactionId amount payDate",
      });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error("Get order by id error:", error);
    return res.status(500).json({
      message: `Get order by id error: ${error.message}`,
    });
  }
};

// Hủy đơn hàng
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({
      _id: orderId,
      user: req.userId,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Chỉ cho phép hủy nếu order đang pending hoặc confirmed
    if (!["pending", "confirmed"].includes(order.orderStatus)) {
      return res.status(400).json({
        message: "Cannot cancel order in current status",
      });
    }

    order.orderStatus = "cancelled";
    order.cancelledAt = new Date();
    order.cancelReason = reason || "Cancelled by user";

    await order.save();

    return res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    return res.status(500).json({
      message: `Cancel order error: ${error.message}`,
    });
  }
};

// Cập nhật trạng thái đơn hàng (cho shop owner/admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "delivering",
      "completed",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.orderStatus = status;

    if (status === "completed") {
      order.deliveredAt = new Date();
      // ❌ Xóa: paymentStatus đã được quản lý trong Payment model
    }

    await order.save();

    return res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return res.status(500).json({
      message: `Update order status error: ${error.message}`,
    });
  }
};

// Lấy tất cả đơn hàng của shop owner
export const getShopOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    // Build query để tìm orders có chứa items của shop owner
    const query = {
      "orderItems.shopOwnerId": req.userId,
    };

    if (status) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .populate({
        path: "user",
        select: "fullName email mobile",
      })
      .populate({
        path: "payment",
        select: "paymentMethod status transactionId amount payDate",
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    return res.status(200).json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error("Get shop orders error:", error);
    return res.status(500).json({
      message: `Get shop orders error: ${error.message}`,
    });
  }
};

// Lấy chi tiết đơn hàng của shop owner
export const getShopOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      "orderItems.shopOwnerId": req.userId,
    })
      .populate({
        path: "user",
        select: "fullName email mobile",
      })
      .populate({
        path: "payment",
        select: "paymentMethod status transactionId amount payDate",
      });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error("Get shop order by id error:", error);
    return res.status(500).json({
      message: `Get shop order by id error: ${error.message}`,
    });
  }
};

// Cập nhật trạng thái đơn hàng bởi shop owner
export const updateShopOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "delivering",
      "completed",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findOne({
      _id: orderId,
      "orderItems.shopOwnerId": req.userId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found or you don't have permission to update",
      });
    }

    order.orderStatus = status;

    if (status === "completed") {
      order.deliveredAt = new Date();
      // ❌ Xóa: paymentStatus được quản lý trong Payment model

      // Nếu có drone được giao, cập nhật lại trạng thái và pin của drone
      if (order.drone) {
        const drone = await Drone.findById(order.drone);
        if (drone) {
          drone.status = "available";
          // Cập nhật pin drone theo mức pin cuối cùng trong order, không phải 100%
          drone.battery.current = order.droneBatteryPercentage || 100;
          await drone.save();
        }
      }
    } else if (status === "cancelled") {
      order.cancelledAt = new Date();
      if (!order.cancelReason) {
        order.cancelReason = "Cancelled by shop owner";
      }

      // Nếu đơn bị hủy và có drone, trả drone về available
      if (order.drone) {
        const drone = await Drone.findById(order.drone);
        if (drone) {
          drone.status = "available";
          await drone.save();
        }
      }
    }

    await order.save();

    return res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update shop order status error:", error);
    return res.status(500).json({
      message: `Update shop order status error: ${error.message}`,
    });
  }
};

// Lấy danh sách drones có sẵn cho shop owner
export const getAvailableDrones = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Lấy order để xác định shop
    const order = await Order.findOne({
      _id: orderId,
      "orderItems.shopOwnerId": req.userId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found or you don't have permission",
      });
    }

    // Lấy shopId từ orderItems (lấy shop đầu tiên)
    const shopId = order.orderItems[0].shopId;

    // Lấy drones available của shop
    const drones = await Drone.find({
      shop: shopId,
      status: "available",
      isActive: true,
      "battery.current": { $gte: 30 }, // Chỉ lấy drone có pin >= 30%
    }).select("model serialNumber battery status specifications");

    return res.status(200).json({
      drones,
    });
  } catch (error) {
    console.error("Get available drones error:", error);
    return res.status(500).json({
      message: `Get available drones error: ${error.message}`,
    });
  }
};

// Assign drone cho order và chuyển sang delivering
// Helper function: Calculate distance using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance; // in kilometers
};

export const assignDroneToOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { droneId } = req.body;

    if (!droneId) {
      return res.status(400).json({ message: "Drone ID is required" });
    }

    // Kiểm tra order
    const order = await Order.findOne({
      _id: orderId,
      "orderItems.shopOwnerId": req.userId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found or you don't have permission",
      });
    }

    // Kiểm tra order phải ở trạng thái preparing
    if (order.orderStatus !== "preparing") {
      return res.status(400).json({
        message: "Order must be in preparing status to assign drone",
      });
    }

    // Kiểm tra drone
    const drone = await Drone.findById(droneId).populate("shop");
    if (!drone) {
      return res.status(404).json({ message: "Drone not found" });
    }

    if (drone.status !== "available") {
      return res.status(400).json({ message: "Drone is not available" });
    }

    // Calculate distance from shop to delivery address
    let deliveryDistance = 0;
    if (drone.shop && drone.shop.coordinates && order.deliveryAddress?.coordinates) {
      deliveryDistance = calculateDistance(
        drone.shop.coordinates.lat,
        drone.shop.coordinates.lng,
        order.deliveryAddress.coordinates.lat,
        order.deliveryAddress.coordinates.lng
      );
    }

    // Cập nhật order và drone
    // Generate 6-digit confirmation code
    const confirmCode = Math.floor(100000 + Math.random() * 900000).toString();

    order.drone = droneId;
    order.droneBatteryPercentage = drone.battery?.current || 100;
    order.orderStatus = "delivering";
    order.confirmCode = confirmCode;
    order.deliveryDistance = deliveryDistance;
    await order.save();

    // Cập nhật trạng thái drone
    drone.status = "busy";
    drone.flightStats.totalFlights += 1;
    await drone.save();

    // Emit Socket.io event to notify DroneSimulator
    const io = req.app.get("io");
    if (io) {
      io.emit("drone-assigned", {
        droneId: droneId,
        orderId: orderId,
        confirmCode: confirmCode,
        deliveryDistance: deliveryDistance,
        deliveryAddress: order.deliveryAddress,
        shopAddress: drone.shop?.address || "Unknown",
        shopCoordinates: drone.shop?.coordinates,
      });
      console.log(`Emitted drone-assigned event for drone ${droneId}, order ${orderId}`);
    }

    return res.status(200).json({
      message: "Drone assigned successfully and order is now delivering",
      order,
      drone,
      confirmCode,
      deliveryDistance: deliveryDistance.toFixed(2) + " km",
    });
  } catch (error) {
    console.error("Assign drone to order error:", error);
    return res.status(500).json({
      message: `Assign drone to order error: ${error.message}`,
    });
  }
};

// Cập nhật phần trăm pin của drone trong order
export const updateDroneBattery = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { batteryPercentage } = req.body;

    console.log("Update drone battery request:", {
      orderId,
      batteryPercentage,
      userId: req.userId,
    });

    // Validation
    if (batteryPercentage === undefined || batteryPercentage === null) {
      return res
        .status(400)
        .json({ message: "Battery percentage is required" });
    }

    if (batteryPercentage < 0 || batteryPercentage > 100) {
      return res.status(400).json({
        message: "Battery percentage must be between 0 and 100",
      });
    }

    // Tìm order
    const order = await Order.findOne({
      _id: orderId,
      "orderItems.shopOwnerId": req.userId,
    });

    console.log("Order found:", order ? "Yes" : "No");

    if (!order) {
      return res.status(404).json({
        message: "Order not found or you don't have permission",
      });
    }

    // Kiểm tra order phải có drone được assign
    if (!order.drone) {
      return res.status(400).json({
        message: "No drone assigned to this order",
      });
    }

    // Kiểm tra order phải đang delivering
    if (order.orderStatus !== "delivering") {
      return res.status(400).json({
        message: "Can only update battery for orders in delivering status",
      });
    }

    // Cập nhật battery percentage trong order
    order.droneBatteryPercentage = batteryPercentage;
    await order.save();

    console.log("Order updated successfully");

    // Cập nhật battery trong drone model
    const drone = await Drone.findById(order.drone);
    if (drone) {
      console.log("Updating drone battery:", drone._id);
      drone.battery.current = Number(batteryPercentage);
      await drone.save();
      console.log("Drone battery updated successfully");
    }

    return res.status(200).json({
      message: "Drone battery updated successfully",
      order,
      droneBatteryPercentage: order.droneBatteryPercentage,
    });
  } catch (error) {
    console.error("Update drone battery error:", error);
    return res.status(500).json({
      message: `Update drone battery error: ${error.message}`,
    });
  }
};

// Get order by drone ID (for DroneSimulator to fetch active order)
export const getOrderByDroneId = async (req, res) => {
  try {
    const { droneId } = req.params;

    // Find order with this drone that is currently delivering
    const order = await Order.findOne({
      drone: droneId,
      orderStatus: "delivering",
    });

    if (!order) {
      return res.status(404).json({
        message: "No active order found for this drone",
        order: null,
      });
    }

    return res.status(200).json({
      message: "Order found",
      order,
    });
  } catch (error) {
    console.error("Get order by drone ID error:", error);
    return res.status(500).json({
      message: `Get order by drone ID error: ${error.message}`,
    });
  }
};

// Verify confirmation code and complete order
export const verifyConfirmCode = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { confirmCode } = req.body;

    if (!confirmCode) {
      return res.status(400).json({ message: "Confirmation code is required" });
    }

    // Find order
    const order = await Order.findOne({
      _id: orderId,
      user: req.userId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found or you don't have permission",
      });
    }

    // Check if order is delivering
    if (order.orderStatus !== "delivering") {
      return res.status(400).json({
        message: "Order is not in delivering status",
      });
    }

    // Verify code
    if (order.confirmCode !== confirmCode) {
      return res.status(400).json({
        message: "Invalid confirmation code",
      });
    }

    // Update order to completed
    order.orderStatus = "completed";
    order.deliveredAt = new Date();
    await order.save();

    // Update drone status back to available
    if (order.drone) {
      const drone = await Drone.findById(order.drone);
      if (drone) {
        drone.status = "available";
        await drone.save();
      }
    }

    return res.status(200).json({
      message: "Order completed successfully",
      order,
    });
  } catch (error) {
    console.error("Verify confirm code error:", error);
    return res.status(500).json({
      message: `Verify confirm code error: ${error.message}`,
    });
  }
};
