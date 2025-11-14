import {
  createVNPayUrl,
  verifyVNPayReturn,
  vnpayResponseCodes,
} from "../utils/vnpay.js";
import Payment from "../models/payment.model.js";
import Order from "../models/order.model.js";
import Shop from "../models/shop.model.js";
import Cart from "../models/cart.model.js";
import Item from "../models/item.model.js";

// Tạo URL thanh toán VNPay (TẠO ORDER TRƯỚC RỒI)
export const createVNPayPaymentUrl = async (req, res) => {
  try {
    const { orderId, amount, bankCode } = req.body;

    console.log("========== CREATE VNPAY PAYMENT URL ==========");
    console.log("1. Order ID:", orderId);
    console.log("2. Amount:", amount);

    // Validate input
    if (!orderId || !amount) {
      return res.status(400).json({
        success: false,
        message: "orderId và amount là bắt buộc",
      });
    }

    // Verify order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    // Verify user owns this order
    if (order.user.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền thanh toán đơn hàng này",
      });
    }

    // Lấy IP address của client
    const ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket?.remoteAddress ||
      "127.0.0.1";

    console.log("3. Creating payment record...");

    // Tạo payment record
    const payment = await Payment.create({
      user: req.userId,
      order: orderId,
      amount: amount,
      paymentMethod: "vnpay",
      status: "pending",
      transactionId: `TEMP_${req.userId}_${Date.now()}`,
    });

    console.log("4. Payment created:", payment._id);

    // Tạo VNPay URL với orderId làm vnp_TxnRef
    const paymentUrl = createVNPayUrl(
      orderId, // Dùng orderId để dễ tìm order khi callback
      amount,
      ipAddr,
      `Thanh toan don hang ${orderId}`,
      bankCode || ""
    );

    console.log("5. VNPay URL created successfully");
    console.log("===============================================");

    return res.status(200).json({
      success: true,
      message: "Tạo URL thanh toán thành công",
      data: {
        paymentUrl,
        paymentId: payment._id,
        orderId: orderId,
      },
    });
  } catch (error) {
    console.error("❌ Create VNPay payment URL error:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi tạo URL thanh toán",
      error: error.message,
    });
  }
};

// Xử lý return từ VNPay (sau khi user thanh toán xong)
// UPDATE ORDER NGAY trước khi redirect về frontend
export const vnpayReturn = async (req, res) => {
  try {
    const vnp_Params = req.query;
    console.log("VNPay return callback received:", vnp_Params);

    // Verify signature
    const isValid = verifyVNPayReturn(vnp_Params);
    if (!isValid) {
      console.error("Invalid VNPay signature!");
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment-return?status=error&message=Invalid+signature`
      );
    }

    const orderId = vnp_Params.vnp_TxnRef;
    const responseCode = vnp_Params.vnp_ResponseCode;
    const transactionNo = vnp_Params.vnp_TransactionNo;
    const amount = vnp_Params.vnp_Amount / 100;
    const bankCode = vnp_Params.vnp_BankCode;
    const payDate = vnp_Params.vnp_PayDate;

    // Tìm order
    const order = await Order.findById(orderId);
    if (!order) {
      console.error(`Order not found: ${orderId}`);
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment-return?status=error&message=Order+not+found`
      );
    }

    // Tìm payment - TÌM THEO ORDER ID (không cần check status)
    const payment = await Payment.findOne({ order: orderId });

    console.log(
      `🔍 Payment lookup for order ${orderId}:`,
      payment
        ? `Found (ID: ${payment._id}, Status: ${payment.status})`
        : "NOT FOUND"
    );

    if (responseCode === "00") {
      // Thanh toán thành công
      console.log(`✅ Payment successful for order: ${orderId}`);

      let savedPayment;
      if (payment) {
        payment.status = "success";
        payment.transactionId = transactionNo;
        payment.bankCode = bankCode;
        payment.payDate = payDate;
        await payment.save();
        savedPayment = payment;
        console.log(`💾 Payment updated: ${payment._id} - Status: success`);
      } else {
        console.error(
          `⚠️ WARNING: Payment record not found for order ${orderId}! Creating new payment...`
        );
        // Tạo payment record nếu không tồn tại
        const newPayment = await Payment.create({
          user: order.user,
          order: orderId,
          amount: amount,
          paymentMethod: "vnpay",
          status: "success",
          transactionId: transactionNo,
          bankCode: bankCode,
          payDate: payDate,
        });
        savedPayment = newPayment;
        console.log(`💾 New payment created: ${newPayment._id}`);
      }

      // CẬP NHẬT ORDER
      order.payment = savedPayment._id; // ✅ Lưu reference đến payment
      order.orderStatus = "confirmed"; // Chuyển sang confirmed
      await order.save();

      console.log(
        `Order updated: ${orderId} - Status: confirmed, Payment: ${savedPayment._id}`
      );

      // ✅ TRỪ SỐ LƯỢNG SẢN PHẨM trong kho
      try {
        for (const orderItem of order.orderItems) {
          const item = await Item.findById(orderItem.itemId);
          if (item) {
            // Trừ stock
            item.stock = Math.max(0, item.stock - orderItem.quantity);
            await item.save();
            console.log(
              `📦 Stock updated for item ${item.name}: ${
                item.stock + orderItem.quantity
              } → ${item.stock}`
            );
          } else {
            console.warn(`⚠️ Item not found: ${orderItem.itemId}`);
          }
        }
      } catch (stockError) {
        console.error("Error updating stock:", stockError);
        // Không throw error, vì order đã thành công
      }

      // ✅ XÓA GIỎ HÀNG sau khi thanh toán thành công
      try {
        const cart = await Cart.findOne({ user: order.user });
        if (cart) {
          cart.cartItems = [];
          cart.totalAmount = 0;
          await cart.save();
          console.log(`✅ Cart cleared for user: ${order.user}`);
        }
      } catch (cartError) {
        console.error("Error clearing cart:", cartError);
        // Không throw error, vì order đã thành công
      }

      // Redirect về frontend với thông tin thành công
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment-return?status=success&orderId=${orderId}&amount=${amount}&transactionNo=${transactionNo}`
      );
    } else {
      // Thanh toán thất bại
      console.log(
        `❌ Payment failed for order: ${orderId}, Code: ${responseCode}`
      );

      if (payment) {
        payment.status = "failed";
        payment.failureReason =
          vnpayResponseCodes[responseCode] || "Giao dịch thất bại";
        await payment.save();
        console.log(`💾 Payment updated to failed: ${payment._id}`);
      } else {
        console.error(
          `⚠️ WARNING: Payment record not found for failed order ${orderId}! Creating new payment...`
        );
        // Tạo payment record nếu không tồn tại (trường hợp failed)
        await Payment.create({
          user: order.user,
          order: orderId,
          amount: amount,
          paymentMethod: "vnpay",
          status: "failed",
          failureReason:
            vnpayResponseCodes[responseCode] || "Giao dịch thất bại",
        });
      }

      order.payment = payment?._id; // Lưu payment reference (nếu có)
      await order.save();

      return res.redirect(
        `${
          process.env.FRONTEND_URL
        }/payment-return?status=failed&message=${encodeURIComponent(
          vnpayResponseCodes[responseCode] || "Giao dịch thất bại"
        )}`
      );
    }
  } catch (error) {
    console.error("VNPay return error:", error);
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment-return?status=error&message=System+error`
    );
  }
};

// ❌ REMOVED OLD FUNCTION: verifyAndUpdatePayment
// This function creates NEW order instead of updating existing one - WRONG LOGIC!
// Use vnpayReturn() above instead

// Xử lý IPN từ VNPay (webhook)
export const vnpayIPN = async (req, res) => {
  try {
    let vnp_Params = req.query;
    const secureHash = vnp_Params["vnp_SecureHash"];

    // Verify signature
    const isValid = verifyVNPayReturn(vnp_Params);

    const orderId = vnp_Params["vnp_TxnRef"];
    const responseCode = vnp_Params["vnp_ResponseCode"];
    const transactionNo = vnp_Params["vnp_TransactionNo"];
    const amount = vnp_Params["vnp_Amount"] / 100;

    // Tìm order
    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(200)
        .json({ RspCode: "01", Message: "Order not found" });
    }

    // Tìm payment
    const payment = await Payment.findOne({ order: orderId });
    if (!payment) {
      return res
        .status(200)
        .json({ RspCode: "01", Message: "Payment not found" });
    }

    // Kiểm tra số tiền
    if (payment.amount !== amount) {
      return res.status(200).json({ RspCode: "04", Message: "Invalid Amount" });
    }

    if (!isValid) {
      return res
        .status(200)
        .json({ RspCode: "97", Message: "Invalid Checksum" });
    }

    // Kiểm tra trạng thái payment
    if (payment.status !== "pending") {
      return res.status(200).json({
        RspCode: "02",
        Message: "Order already confirmed",
      });
    }

    if (responseCode === "00") {
      // Thanh toán thành công
      payment.status = "success";
      payment.transactionId = transactionNo;
      await payment.save();

      order.paymentStatus = "paid";
      order.paidAt = new Date();
      await order.save();

      // ✅ TRỪ SỐ LƯỢNG SẢN PHẨM trong kho (IPN backup)
      try {
        for (const orderItem of order.orderItems) {
          const item = await Item.findById(orderItem.itemId);
          if (item && item.stock >= orderItem.quantity) {
            item.stock -= orderItem.quantity;
            await item.save();
          }
        }
      } catch (stockError) {
        console.error("IPN: Error updating stock:", stockError);
      }

      return res.status(200).json({ RspCode: "00", Message: "Success" });
    } else {
      // Thanh toán thất bại
      payment.status = "failed";
      payment.failureReason =
        vnpayResponseCodes[responseCode] || "Transaction failed";
      await payment.save();

      return res.status(200).json({ RspCode: "00", Message: "Success" });
    }
  } catch (error) {
    console.error("VNPay IPN error:", error);
    return res.status(200).json({ RspCode: "99", Message: "Unknown error" });
  }
};

// Tạo payment thủ công (cho các phương thức khác)
export const createPayment = async (req, res) => {
  try {
    const { orderId, amount, paymentMethod } = req.body;

    const payment = await Payment.create({
      user: req.user._id,
      order: orderId,
      amount,
      paymentMethod,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Tạo payment thành công",
      data: payment,
    });
  } catch (error) {
    console.error("Create payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi tạo payment",
      error: error.message,
    });
  }
};

// Lấy payments của user
export const getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate("order")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error("Get user payments error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách payments",
      error: error.message,
    });
  }
};

// Lấy payment theo ID
export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId).populate(
      "order"
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy payment",
      });
    }

    // Kiểm tra quyền truy cập
    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xem payment này",
      });
    }

    return res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error("Get payment by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin payment",
      error: error.message,
    });
  }
};

// Cập nhật trạng thái payment
export const updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const payment = await Payment.findById(req.params.paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy payment",
      });
    }

    payment.status = status;
    await payment.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái payment thành công",
      data: payment,
    });
  } catch (error) {
    console.error("Update payment status error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật trạng thái payment",
      error: error.message,
    });
  }
};

// Hoàn tiền
export const refundPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy payment",
      });
    }

    if (payment.status !== "success") {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể hoàn tiền cho giao dịch thành công",
      });
    }

    // TODO: Implement VNPay refund API
    // Cần gọi API refund của VNPay ở đây

    payment.status = "refunded";
    await payment.save();

    return res.status(200).json({
      success: true,
      message: "Hoàn tiền thành công",
      data: payment,
    });
  } catch (error) {
    console.error("Refund payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi hoàn tiền",
      error: error.message,
    });
  }
};
