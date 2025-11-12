// Script để tạo tài khoản admin
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Tạo admin mới
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = await User.create({
      fullName: "Admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
      phone: "0123456789",
    });

    console.log("✅ Admin account created successfully!");
    console.log("Email:", admin.email);
    console.log("Password: admin123");
    console.log("\nBạn có thể đăng nhập vào Admin Dashboard với:");
    console.log("- Email: admin@example.com");
    console.log("- Password: admin123");

    process.exit(0);
  } catch (error) {
    if (error.code === 11000) {
      console.log("⚠️ Admin account already exists!");
      console.log("Email: admin@example.com");
      console.log("Password: admin123");
    } else {
      console.error("Error:", error.message);
    }
    process.exit(1);
  }
};

createAdmin();
