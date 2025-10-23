import Payment from "../models/payment.model.js";
import Order from "../models/order.model.js";

// Tạo payment mới
export const createPayment = async (req, res) => {
  try {
    const { orderId, amount, method, paymentDetails } = req.body;
    const userId = req.user.id;

    // Kiểm tra order tồn tại và thuộc về user
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    // Kiểm tra payment đã tồn tại cho order này
    const existingPayment = await Payment.findOne({ order: orderId });
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "Đơn hàng đã có thanh toán",
      });
    }

    const payment = new Payment({
      order: orderId,
      user: userId,
      amount,
      method,
      paymentDetails,
    });

    await payment.save();

    res.status(201).json({
      success: true,
      message: "Thanh toán được tạo thành công",
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Lấy payments của user
export const getUserPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { user: userId };
    if (status) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .populate("order", "orderStatus totalAmount")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: payments,
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

// Lấy payment theo ID
export const getPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findOne({ _id: paymentId, user: userId })
      .populate("order", "orderStatus totalAmount items");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thanh toán",
      });
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Cập nhật trạng thái payment
export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status, transactionId, failedReason } = req.body;
    const userId = req.user.id;

    const payment = await Payment.findOne({ _id: paymentId, user: userId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thanh toán",
      });
    }

    const updateData = { status };
    if (transactionId) updateData.transactionId = transactionId;
    if (failedReason) updateData.failedReason = failedReason;
    if (status === "completed") updateData.processedAt = new Date();

    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      updateData,
      { new: true, runValidators: true }
    );

    // Cập nhật trạng thái order nếu payment thành công
    if (status === "completed") {
      await Order.findByIdAndUpdate(payment.order, {
        paymentStatus: "paid",
        orderStatus: "confirmed",
      });
    }

    res.status(200).json({
      success: true,
      message: "Trạng thái thanh toán được cập nhật thành công",
      data: updatedPayment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Hoàn tiền
export const refundPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { refundAmount, reason } = req.body;
    const userId = req.user.id;

    const payment = await Payment.findOne({ _id: paymentId, user: userId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thanh toán",
      });
    }

    if (payment.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể hoàn tiền cho thanh toán đã hoàn thành",
      });
    }

    const refund = Math.min(refundAmount || payment.amount, payment.amount);

    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        status: "refunded",
        refundAmount: refund,
        refundedAt: new Date(),
        failedReason: reason,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Hoàn tiền thành công",
      data: updatedPayment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};
