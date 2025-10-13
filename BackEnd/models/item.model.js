import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    image: {
      type: String,
      require: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
    },
    category: {
      type: String,
      enum: [
        "Burgers",
        "Sandwiches",
        "Fried",
        "Desserts",
        "Drinks",
        "Tacos",
        "Others",
      ],
      require: true,
    },
    price: {
      type: Number,
      min: 0,
      require: true,
    },
    foodType: {
      type: String,
      enum: ["veg", "non-veg"],
      require: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Item = mongoose.model("Item", itemSchema);
export default Item;
//
