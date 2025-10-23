import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { serverURL } from "../App.jsx";

const useGetShopOrders = (status = null) => {
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
  }, [fetchOrders]);

  return { orders, loading, error, refetchOrders: fetchOrders };
};

export default useGetShopOrders;
