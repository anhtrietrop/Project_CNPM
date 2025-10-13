import { useState } from "react";
import axios from "axios";
import { serverURL } from "../App.jsx";

function useRating() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Thêm đánh giá
  const addRating = async (itemId, rating, comment = "") => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${serverURL}/api/rating/item/${itemId}`,
        { rating, comment },
        { withCredentials: true }
      );
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add rating");
      console.error("Add rating error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Lấy đánh giá của item
  const getItemRatings = async (itemId, page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${serverURL}/api/rating/item/${itemId}?page=${page}&limit=${limit}`
      );
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to get ratings");
      console.error("Get ratings error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Xóa đánh giá
  const deleteRating = async (ratingId) => {
    try {
      setLoading(true);
      await axios.delete(`${serverURL}/api/rating/${ratingId}`, {
        withCredentials: true,
      });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete rating");
      console.error("Delete rating error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    addRating,
    getItemRatings,
    deleteRating,
  };
}

export default useRating;
