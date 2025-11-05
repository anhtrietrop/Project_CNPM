import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ["customer", "owner", "admin", "deliveryBoy"],
    },
    description: {
      type: String,
      default: "",
    },
    permissions: [
      {
        type: String,
        enum: [
          "read_orders",
          "write_orders", 
          "read_items",
          "write_items",
          "read_shops",
          "write_shops",
          "read_users",
          "write_users",
          "manage_deliveries",
          "manage_drones",
          "view_analytics"
        ],
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Role = mongoose.model("Role", roleSchema);

export default Role;

