import Rating from "../models/rating.model.js";
import Item from "../models/item.model.js";

// Thêm đánh giá cho item
export const addRating = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { rating, comment } = req.body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        message: "Rating must be between 1 and 5" 
      });
    }

    // Kiểm tra item có tồn tại không
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Kiểm tra user đã đánh giá item này chưa
    const existingRating = await Rating.findOne({
      user: req.userId,
      item: itemId,
    });

    let newRating;
    if (existingRating) {
      // Cập nhật đánh giá cũ
      existingRating.rating = rating;
      existingRating.comment = comment;
      newRating = await existingRating.save();
    } else {
      // Tạo đánh giá mới
      newRating = await Rating.create({
        user: req.userId,
        item: itemId,
        rating,
        comment,
      });
    }

    // Cập nhật rating trung bình của item
    await updateItemRating(itemId);

    await newRating.populate("user", "name email");

    return res.status(200).json(newRating);
  } catch (error) {
    console.error("Add rating error:", error);
    return res.status(500).json({ message: `Add rating error: ${error.message}` });
  }
};

// Lấy đánh giá của item
export const getItemRatings = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const ratings = await Rating.find({ item: itemId })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Rating.countDocuments({ item: itemId });

    return res.status(200).json({
      ratings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get item ratings error:", error);
    return res.status(500).json({ message: `Get item ratings error: ${error.message}` });
  }
};

// Xóa đánh giá
export const deleteRating = async (req, res) => {
  try {
    const { ratingId } = req.params;

    const rating = await Rating.findOneAndDelete({
      _id: ratingId,
      user: req.userId,
    });

    if (!rating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    // Cập nhật rating trung bình của item
    await updateItemRating(rating.item);

    return res.status(200).json({ message: "Rating deleted successfully" });
  } catch (error) {
    console.error("Delete rating error:", error);
    return res.status(500).json({ message: `Delete rating error: ${error.message}` });
  }
};

// Helper function để cập nhật rating trung bình của item
const updateItemRating = async (itemId) => {
  try {
    const ratings = await Rating.find({ item: itemId });
    
    if (ratings.length === 0) {
      await Item.findByIdAndUpdate(itemId, {
        rating: 0,
        ratingCount: 0,
      });
      return;
    }

    const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const averageRating = totalRating / ratings.length;

    await Item.findByIdAndUpdate(itemId, {
      rating: Math.round(averageRating * 10) / 10, // Làm tròn đến 1 chữ số thập phân
      ratingCount: ratings.length,
    });
  } catch (error) {
    console.error("Update item rating error:", error);
  }
};
