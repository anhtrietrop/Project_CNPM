import Order from "../models/order.model.js";
import Item from "../models/item.model.js";

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

    // Verify items và lấy thông tin shop
    const orderItems = [];
    for (const cartItem of items) {
      const item = await Item.findById(cartItem.item._id || cartItem.item);
      if (!item) {
        return res.status(404).json({
          message: `Item ${cartItem.item._id || cartItem.item} not found`,
        });
      }

      orderItems.push({
        item: item._id,
        quantity: cartItem.quantity,
        price: item.price,
        shop: item.shop,
      });
    }

    // Tính estimated delivery time (30-45 phút)
    const estimatedDeliveryTime = new Date();
    estimatedDeliveryTime.setMinutes(estimatedDeliveryTime.getMinutes() + 35);

    // Tạo order
    const order = await Order.create({
      user: req.userId,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      contactInfo,
      paymentMethod: paymentMethod || "cash",
      estimatedDeliveryTime,
    });

    // Populate thông tin
    await order.populate([
      {
        path: "items.item",
        select: "name price image category",
      },
      {
        path: "items.shop",
        select: "name city address",
      },
      {
        path: "user",
        select: "name email",
      },
    ]);

    return res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({
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
      .populate([
        {
          path: "items.item",
          select: "name price image category",
        },
        {
          path: "items.shop",
          select: "name city",
        },
      ])
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
    }).populate([
      {
        path: "items.item",
        select: "name price image category",
      },
      {
        path: "items.shop",
        select: "name city address phone",
      },
      {
        path: "user",
        select: "name email phone",
      },
    ]);

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
      order.paymentStatus = "paid";
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
