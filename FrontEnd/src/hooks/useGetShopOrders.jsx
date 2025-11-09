import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { serverURL } from "../App.jsx";

const useGetShopOrders = (status = null, autoRefreshInterval = 0) => {
  // ✅ TẮT auto-refresh
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let url = `${serverURL}/api/order/shop/my-orders`;
      if (status) {
        url += `?status=${status}`;
      }

      const response = await axios.get(url, {
        withCredentials: true,
      });

      if (response.data) {
        setOrders(response.data.orders || []);
      }
    } catch (err) {
      console.error("Error fetching shop orders:", err);
      setError(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchOrders();

    // ✅ Auto-refresh: Tự động fetch đơn hàng mới mỗi X giây
    if (autoRefreshInterval && autoRefreshInterval > 0) {
      const intervalId = setInterval(() => {
        fetchOrders();
      }, autoRefreshInterval);

      // Cleanup interval khi component unmount
      return () => clearInterval(intervalId);
    }
  }, [fetchOrders, autoRefreshInterval]);

  return { orders, loading, error, refetchOrders: fetchOrders };
};

export default useGetShopOrders;
