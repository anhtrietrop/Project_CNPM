import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cartItems: [
      {
        cartItemId: {
          type: mongoose.Schema.Types.ObjectId,
          default: () => new mongoose.Types.ObjectId(),
        },
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        note: {
          type: String,
          default: "",
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
        // Embedded item data for performance
        itemName: {
          type: String,
          required: true,
        },
        itemImage: {
          type: String,
          required: true,
        },
        itemCategory: {
          type: String,
          required: true,
        },
        itemFoodType: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        subtotal: {
          type: Number,
          required: true,
        },
        // Embedded shop data for performance
        shopId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Shop",
          required: true,
        },
        shopName: {
          type: String,
          required: true,
        },
        shopCity: {
          type: String,
          required: true,
        },
        shopState: {
          type: String,
          required: true,
        },
        shopAddress: {
          type: String,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Middleware để tính subtotal và totalAmount trước khi save
cartSchema.pre("save", function (next) {
  if (this.cartItems && this.cartItems.length > 0) {
    // Tính subtotal cho từng cartItem
    this.cartItems.forEach(cartItem => {
      cartItem.subtotal = cartItem.price * cartItem.quantity;
    });
    
    // Tính totalAmount
    this.totalAmount = this.cartItems.reduce((total, cartItem) => total + cartItem.subtotal, 0);
  }
  next();
});

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
