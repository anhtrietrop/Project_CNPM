import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const isAuth = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(400).json({ message: "Token not found" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken) {
      return res.status(400).json({ message: "Invalid token" });
    }

    req.userId = decodedToken.userId;
    next();
  } catch (error) {
    console.log("Auth error:", error);
    return res.status(500).json({ message: "Auth middleware error", error });
  }
};

// Middleware kiểm tra admin
export const isAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Token not found" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Lấy thông tin user để kiểm tra role
    const user = await User.findById(decodedToken.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    req.userId = decodedToken.userId;
    req.user = user;
    next();
  } catch (error) {
    console.log("Admin auth error:", error);
    return res.status(500).json({ message: "Auth middleware error", error });
  }
};

export default isAuth;
