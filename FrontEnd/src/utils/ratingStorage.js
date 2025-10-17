// Utility functions để quản lý rating trong localStorage

const RATING_STORAGE_KEY = "ratings";

// Load tất cả ratings từ localStorage
export const loadRatingsFromStorage = () => {
  try {
    const savedRatings = localStorage.getItem(RATING_STORAGE_KEY);
    if (savedRatings) {
      return JSON.parse(savedRatings);
    }
  } catch (error) {
    console.error("Error loading ratings from localStorage:", error);
  }
  return {};
};

// Save ratings vào localStorage
export const saveRatingsToStorage = (ratings) => {
  try {
    localStorage.setItem(RATING_STORAGE_KEY, JSON.stringify(ratings));
  } catch (error) {
    console.error("Error saving ratings to localStorage:", error);
  }
};

// Thêm hoặc cập nhật rating cho một item
export const addOrUpdateRating = (itemId, userId, rating, comment = "") => {
  const ratings = loadRatingsFromStorage();

  // Tạo key unique cho mỗi rating: itemId_userId
  const ratingKey = `${itemId}_${userId}`;

  ratings[ratingKey] = {
    itemId,
    userId,
    rating,
    comment,
    createdAt: ratings[ratingKey]?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveRatingsToStorage(ratings);
  return ratings[ratingKey];
};

// Lấy tất cả ratings của một item
export const getItemRatings = (itemId) => {
  const ratings = loadRatingsFromStorage();
  const itemRatings = [];

  Object.keys(ratings).forEach((key) => {
    if (ratings[key].itemId === itemId) {
      itemRatings.push(ratings[key]);
    }
  });

  // Sắp xếp theo thời gian mới nhất
  return itemRatings.sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );
};

// Lấy rating của user cho một item cụ thể
export const getUserRatingForItem = (itemId, userId) => {
  const ratings = loadRatingsFromStorage();
  const ratingKey = `${itemId}_${userId}`;
  return ratings[ratingKey] || null;
};

// Xóa rating
export const deleteRating = (itemId, userId) => {
  const ratings = loadRatingsFromStorage();
  const ratingKey = `${itemId}_${userId}`;

  if (ratings[ratingKey]) {
    delete ratings[ratingKey];
    saveRatingsToStorage(ratings);
    return true;
  }
  return false;
};

// Tính rating trung bình và số lượng ratings cho một item
export const calculateItemRatingStats = (itemId) => {
  const itemRatings = getItemRatings(itemId);

  if (itemRatings.length === 0) {
    return {
      averageRating: 0,
      ratingCount: 0,
    };
  }

  const totalRating = itemRatings.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = totalRating / itemRatings.length;

  return {
    averageRating: Math.round(averageRating * 10) / 10, // Làm tròn 1 chữ số thập phân
    ratingCount: itemRatings.length,
  };
};

// Xóa tất cả ratings (dùng khi cần reset)
export const clearAllRatings = () => {
  try {
    localStorage.removeItem(RATING_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Error clearing ratings:", error);
    return false;
  }
};
