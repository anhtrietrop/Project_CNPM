import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../hooks/useToast";
import { formatCurrency } from "../utils/formatCurrency.js";
import useCart from "../hooks/useCart.jsx";

const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(true);

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
        // Clear cart khi thanh toán thành công (backup - backend đã xóa rồi)
        console.log("🛒 Clearing cart...");
        try {
          await clearCart();
          console.log("✅ Cart cleared successfully!");
        } catch (err) {
          console.error("❌ Failed to clear cart:", err);
        }

        // Ẩn loading screen trước
        setIsProcessing(false);

        // Delay nhỏ để đảm bảo DOM đã render
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Hiển thị toast thành công với thông tin chi tiết
        toast.success(
          `🎉 Thanh toán thành công qua VNPay!\n` +
            `Mã đơn hàng: #${orderId?.slice(-8)}\n` +
            `Số tiền: ${formatCurrency(parseInt(amount))}\n` +
            `Mã giao dịch: ${transactionNo}`,
          6000
        );

        // Redirect về trang My Orders sau 3 giây
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        // Ẩn loading screen
        setIsProcessing(false);

        // Delay nhỏ
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Hiển thị toast lỗi với thông tin chi tiết
        toast.error(
          `❌ ${message || "Thanh toán thất bại!"}\n` +
            `Vui lòng thử lại hoặc liên hệ hỗ trợ.`,
          5000
        );

        // Redirect về trang giỏ hàng sau 3 giây
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
    };

    handlePaymentReturn();
  }, [clearCart, searchParams, toast, navigate]);

  // Hiển thị loading trong khi xử lý
  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-t-4 border-[#3399df] mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Đang xử lý thanh toán...
          </h2>
          <p className="text-gray-500 text-sm">Vui lòng không tắt trang này</p>

          {/* Hiển thị thông tin đơn hàng nếu có */}
          {searchParams.get("orderId") && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Mã đơn hàng:{" "}
                <span className="font-semibold">
                  #{searchParams.get("orderId")?.slice(-8)}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Hiển thị màn hình trống sau khi xử lý xong (để toast hiển thị)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-md w-full text-center">
        <div className="text-6xl mb-4">
          {searchParams.get("status") === "success" ? "✅" : "❌"}
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {searchParams.get("status") === "success"
            ? "Thanh toán thành công!"
            : "Thanh toán thất bại"}
        </h2>
        <p className="text-gray-500 text-sm">Đang chuyển hướng...</p>
      </div>
    </div>
  );
};

export default PaymentReturn;
