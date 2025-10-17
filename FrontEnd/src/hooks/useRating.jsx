import { useState } from "react";
import { useSelector } from "react-redux";
import {
  addOrUpdateRating,
  getItemRatings as getItemRatingsFromStorage,
  getUserRatingForItem,
  deleteRating as deleteRatingFromStorage,
  calculateItemRatingStats,
} from "../utils/ratingStorage.js";

function useRating() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy userId từ Redux store (nếu user đã đăng nhập)
  const currentUser = useSelector((state) => state.user.currentUser);
  const userId = currentUser?._id || "guest"; // Dùng "guest" nếu chưa đăng nhập

  // Thêm hoặc cập nhật đánh giá
  const addRating = (itemId, rating, comment = "") => {
    try {
      setLoading(true);
      setError(null);

      // Validation
      if (!rating || rating < 1 || rating > 5) {
        throw new Error("Rating must be between 1 and 5");
      }

      // Lưu rating vào localStorage
      const newRating = addOrUpdateRating(itemId, userId, rating, comment);

      return newRating;
    } catch (err) {
      setError(err.message || "Failed to add rating");
      console.error("Add rating error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Lấy tất cả đánh giá của item
  const getItemRatings = (itemId, page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);

      // Lấy tất cả ratings của item từ localStorage
      const allRatings = getItemRatingsFromStorage(itemId);

      // Phân trang
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedRatings = allRatings.slice(startIndex, endIndex);

      const totalPages = Math.ceil(allRatings.length / limit);

      return {
        ratings: paginatedRatings,
        totalPages,
        currentPage: page,
        total: allRatings.length,
      };
    } catch (err) {
      setError(err.message || "Failed to get ratings");
      console.error("Get ratings error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Lấy rating của user hiện tại cho một item
  const getUserRating = (itemId) => {
    try {
      return getUserRatingForItem(itemId, userId);
    } catch (err) {
      console.error("Get user rating error:", err);
      return null;
    }
  };

  // Xóa đánh giá
  const deleteRating = (itemId) => {
    try {
      setLoading(true);
      setError(null);

      const success = deleteRatingFromStorage(itemId, userId);

      if (!success) {
        throw new Error("Rating not found");
      }

      return true;
    } catch (err) {
      setError(err.message || "Failed to delete rating");
      console.error("Delete rating error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Lấy thống kê rating của item (rating trung bình và số lượng)
  const getItemRatingStats = (itemId) => {
    try {
      return calculateItemRatingStats(itemId);
    } catch (err) {
      console.error("Get rating stats error:", err);
      return {
        averageRating: 0,
        ratingCount: 0,
      };
    }
  };

  return {
    loading,
    error,
    addRating,
    getItemRatings,
    getUserRating,
    deleteRating,
    getItemRatingStats,
  };
}

export default useRating;
