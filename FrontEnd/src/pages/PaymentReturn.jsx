import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../hooks/useToast";
import { formatCurrency } from "../utils/formatCurrency.js";
import useCart from "../hooks/useCart.jsx";

const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { clearCart } = useCart();

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

        // Hiển thị toast thành công
        toast.success(
          `Thanh toán thành công! Đơn hàng #${orderId?.slice(
            -8
          )} đã được xác nhận. Số tiền: ${formatCurrency(parseInt(amount))}`,
          5000
        );

        // Redirect về trang chủ sau 1 giây
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        // Hiển thị toast lỗi
        toast.error(message || "Thanh toán thất bại! Vui lòng thử lại.", 5000);

        // Redirect về trang chủ sau 2 giây
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    };

    handlePaymentReturn();
  }, [clearCart, searchParams, toast, navigate]);

  // Hiển thị loading trong khi xử lý
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#3399df] mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-gray-800">Đang xử lý...</h2>
      </div>
    </div>
  );
};

export default PaymentReturn;
