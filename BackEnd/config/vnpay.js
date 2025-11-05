// config/vnpay.js
export const vnpayConfig = {
  vnp_TmnCode: "T465P0J7",
  vnp_HashSecret: "245VS8AWRG9LOCQ3A56MU8IKIX3NAJL9",
  vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",

  // ✅ FIXED: VNPay phải callback về BACKEND trước, backend sẽ redirect về frontend
  vnp_ReturnUrl: "http://localhost:8000/api/payment/vnpay/return",

  vnp_Api: "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction",
};
