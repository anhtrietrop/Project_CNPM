import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// Đảm bảo mỗi user chỉ có thể đánh giá một item một lần
ratingSchema.index({ user: 1, item: 1 }, { unique: true });

const Rating = mongoose.model("Rating", ratingSchema);
export default Rating;
