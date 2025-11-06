import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa";
import { formatCurrency } from "../utils/formatCurrency.js";
import useCart from "../hooks/useCart.jsx";

const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [paymentStatus, setPaymentStatus] = useState("processing");
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handlePaymentReturn = async () => {
      // Backend đã xử lý hết rồi, chỉ cần đọc params từ URL
      const status = searchParams.get("status");
      const orderId = searchParams.get("orderId");
      const amount = searchParams.get("amount");
      const transactionNo = searchParams.get("transactionNo");
      const message = searchParams.get("message");

      console.log("========== PAYMENT RETURN ==========");
      console.log("Status:", status);
      console.log("Order ID:", orderId);
      console.log("Amount:", amount);
      console.log("Transaction No:", transactionNo);

      if (status === "success") {
        setPaymentStatus("success");
        setPaymentData({
          orderId,
          amount: parseInt(amount),
          transactionNo,
        });

        // Clear cart khi thanh toán thành công (backup - backend đã xóa rồi)
        console.log("🛒 Clearing cart...");
        try {
          await clearCart();
          console.log("✅ Cart cleared successfully!");
        } catch (err) {
          console.error("❌ Failed to clear cart:", err);
          // Backend đã xóa rồi nên không cần throw error
        }
      } else {
        setPaymentStatus("failed");
        setError(message || "Giao dịch thất bại");
        console.log("❌ Payment failed:", message);
      }
    };

    handlePaymentReturn();
  }, [clearCart, searchParams]);

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleViewOrders = () => {
    navigate("/"); // Hoặc navigate("/orders") nếu có trang orders
  };

  if (paymentStatus === "processing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <FaSpinner className="animate-spin text-[#3399df] text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Đang xử lý thanh toán...
          </h2>
          <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <FaCheckCircle className="text-green-500 text-5xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Thanh toán thành công!
            </h2>
            <p className="text-gray-600">
              Đơn hàng của bạn đã được thanh toán và đang được xử lý
            </p>
          </div>

          {paymentData && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-medium">
                  #{paymentData.orderId?.slice(-8)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Mã giao dịch:</span>
                <span className="font-medium">{paymentData.transactionNo}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Số tiền:</span>
                <span className="font-bold text-[#3399df]">
                  {formatCurrency(paymentData.amount)}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleViewOrders}
              className="w-full bg-[#3399df] text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Xem đơn hàng
            </button>
            <button
              onClick={handleBackToHome}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Payment failed
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <FaTimesCircle className="text-red-500 text-5xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Thanh toán thất bại!
          </h2>
          <p className="text-gray-600">
            {error || "Có lỗi xảy ra trong quá trình thanh toán"}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate("/checkout")}
            className="w-full bg-[#3399df] text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Thử lại
          </button>
          <button
            onClick={handleBackToHome}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentReturn;
