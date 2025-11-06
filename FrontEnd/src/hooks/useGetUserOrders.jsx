import { useEffect, useState } from "react";
import axios from "axios";
import { serverURL } from "../App.jsx";

const useGetUserOrders = (status = "", autoRefreshInterval = 30000) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = status
        ? `${serverURL}/api/order?status=${status}`
        : `${serverURL}/api/order`;

      const response = await axios.get(url, {
        withCredentials: true,
      });

      setOrders(response.data.orders || []);
    } catch (err) {
      console.error("Error fetching user orders:", err);
      setError(err.response?.data?.message || "Không thể tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // ✅ Auto-refresh: Tự động fetch đơn hàng mới mỗi X giây
    if (autoRefreshInterval && autoRefreshInterval > 0) {
      const intervalId = setInterval(() => {
        console.log("🔄 Auto-refreshing user orders...");
        fetchOrders();
      }, autoRefreshInterval);

      // Cleanup interval khi component unmount
      return () => clearInterval(intervalId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, autoRefreshInterval]);

  return { orders, loading, error, refetchOrders: fetchOrders };
};

export default useGetUserOrders;
