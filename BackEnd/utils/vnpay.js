import crypto from "crypto";
import { vnpayConfig } from "../config/vnpay.js";

// ========================
// Hàm sắp xếp key alphabet
// ========================
export function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
}

// ============================================
// Hàm encode theo chuẩn PHP urlencode (RFC3986)
// => encodeURIComponent() + thay %20 bằng +
// ============================================
function encodeParams(obj) {
  return Object.keys(obj)
    .map((key) => {
      const k = encodeURIComponent(key);
      const v = encodeURIComponent(String(obj[key])).replace(/%20/g, "+");
      return `${k}=${v}`;
    })
    .join("&");
}

// ============================================
// Format datetime theo chuẩn VNPay yyyyMMddHHmmss
// ============================================
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// ============================================
// Tạo URL thanh toán VNPay
// ============================================
export function createVNPayUrl(
  orderId,
  amount,
  ipAddr,
  orderInfo = "",
  bankCode = ""
) {
  const date = new Date();
  const createDate = formatDate(date);
  const expireDate = formatDate(new Date(date.getTime() + 15 * 60 * 1000)); // 15 phút

  // Bỏ dấu tiếng Việt khỏi orderInfo
  const normalizedOrderInfo = (orderInfo || `Thanh toan cho ma GD:${orderId}`)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");

  let vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: vnpayConfig.vnp_TmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: normalizedOrderInfo,
    vnp_OrderType: "other",
    vnp_Amount: amount * 100,
    vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  if (bankCode) vnp_Params["vnp_BankCode"] = bankCode;

  vnp_Params = sortObject(vnp_Params);

  // === Tạo chữ ký ===
  const signData = encodeParams(vnp_Params);
  const hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret.trim());
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  vnp_Params["vnp_SecureHashType"] = "SHA512";
  vnp_Params["vnp_SecureHash"] = signed;

  // URL thanh toán hoàn chỉnh
  const paymentUrl = vnpayConfig.vnp_Url + "?" + encodeParams(vnp_Params);

  // === Log debug ===
  console.log("===== VNPay URL Generation =====");
  console.log("Sorted Params:", vnp_Params);
  console.log("Sign Data:", signData);
  console.log("Generated Hash:", signed);
  console.log("Final URL:", paymentUrl);
  console.log("================================");

  return paymentUrl;
}

// ============================================
// Xác minh chữ ký khi VNPay redirect về
// ============================================
export function verifyVNPayReturn(vnpParams) {
  const secureHash = vnpParams["vnp_SecureHash"];
  delete vnpParams["vnp_SecureHash"];
  delete vnpParams["vnp_SecureHashType"];

  const sortedParams = sortObject(vnpParams);
  const signData = encodeParams(sortedParams);

  const hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret.trim());
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  console.log("===== VNPay Return Verify =====");
  console.log("Sign Data:", signData);
  console.log("Expected Hash:", signed.toLowerCase());
  console.log("Received Hash:", String(secureHash).toLowerCase());
  console.log("================================");

  return String(secureHash).toLowerCase() === signed.toLowerCase();
}

// ============================================
// Bảng mã lỗi phản hồi VNPay
// ============================================
export const vnpayResponseCodes = {
  "00": "Giao dịch thành công",
  "07": "Trừ tiền thành công nhưng nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
  "09": "Khách hàng chưa đăng ký InternetBanking.",
  10: "Sai thông tin xác thực quá 3 lần.",
  11: "Hết hạn chờ thanh toán.",
  12: "Tài khoản bị khóa.",
  13: "Sai mật khẩu OTP.",
  24: "Khách hàng hủy giao dịch.",
  51: "Không đủ số dư.",
  65: "Vượt hạn mức giao dịch trong ngày.",
  75: "Ngân hàng bảo trì.",
  79: "Sai mật khẩu thanh toán quá số lần quy định.",
  97: "Sai chữ ký.",
  99: "Lỗi không xác định.",
};
