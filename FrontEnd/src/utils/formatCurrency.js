// Format number to Vietnamese currency format
// Example: 40000 -> "40.000 VNĐ"
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "0 VNĐ";
  }

  // Convert to number and round to avoid decimal issues
  const number = Math.round(Number(amount));

  // Format with dot as thousand separator
  const formatted = number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${formatted} VNĐ`;
};
