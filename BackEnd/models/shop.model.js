import mongoose from "mongoose";
const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    image: {
      type: String,
      require: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      require: true,
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
      },
    ],
    categories: [
      {
        type: String,
        trim: true,
      },
    ],
    // Thông tin liên hệ
    contactPhone: {
      type: String,
      require: true,
    },
    contactEmail: {
      type: String,
    },
    // Thông tin người đại diện
    representativeName: {
      type: String,
      require: true,
    },
    representativeIdCard: {
      type: String, // Ảnh CCCD
    },
    // Thông tin thanh toán
    bankAccountNumber: {
      type: String,
      require: true,
    },
    bankAccountName: {
      type: String,
      require: true,
    },
    bankName: {
      type: String,
    },
    // Ảnh bổ sung
    menuImages: [
      {
        type: String, // Array ảnh menu
      },
    ],
    // Giờ hoạt động
    operatingHours: {
      type: String,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    rejectedReason: {
      type: String,
    },
  },
  { timestamps: true }
);

const Shop = mongoose.model("Shop", shopSchema);

export default Shop;
