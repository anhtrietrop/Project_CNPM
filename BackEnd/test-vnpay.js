import crypto from "crypto";
import querystring from "querystring"; // Đổi sang querystring built-in

const vnpayConfig = {
  vnp_TmnCode: "T465P0J7",
  vnp_HashSecret: "245VS8AWRG9LOCQ3A56MU8IKIX3NAJL9",
  vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  vnp_ReturnUrl: "http://localhost:8000/api/payment/vnpay/return",
};

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(key);
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = obj[str[key]];
  }
  return sorted;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

function createVNPayUrl(orderId, amount, ipAddr, bankCode = "") {
  const date = new Date();
  const createDate = formatDate(date);
  const expireDate = formatDate(new Date(date.getTime() + 15 * 60 * 1000));

  let vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: vnpayConfig.vnp_TmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
    vnp_OrderType: "other",
    vnp_Amount: amount * 100,
    vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  if (bankCode) {
    vnp_Params["vnp_BankCode"] = bankCode;
  }

  console.log("\n=== BEFORE SORT ===");
  console.log(vnp_Params);

  vnp_Params = sortObject(vnp_Params);

  console.log("\n=== AFTER SORT ===");
  console.log(vnp_Params);

  const signData = querystring.stringify(vnp_Params);
  console.log("\n=== SIGN DATA ===");
  console.log(signData);

  const hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  console.log("\n=== HASH ===");
  console.log(signed);

  vnp_Params["vnp_SecureHash"] = signed;

  const paymentUrl =
    vnpayConfig.vnp_Url + "?" + querystring.stringify(vnp_Params);

  console.log("\n=== FINAL URL ===");
  console.log(paymentUrl);

  return paymentUrl;
}

// Test
const orderId = "6734561a123456789abc1234";
const amount = 50000; // 50,000 VND
const ipAddr = "127.0.0.1";

createVNPayUrl(orderId, amount, ipAddr, "");
