import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobile: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "owner", "deliveryBoy"],
      required: true,
    },
    isBlocked: { type: Boolean, default: false },
    resetOtp: { type: String },
    otpExpiries: { type: Date },
    isOtpVerified: { type: Boolean, default: false },
  },

  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
