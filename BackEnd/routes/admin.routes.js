import express from "express";
import {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  toggleBlockUser,
  getAllShops,
  approveShop,
  rejectShop,
  deleteShop,
} from "../controllers/admin.controllers.js";
import { isAdmin } from "../middlewares/isAuth.js";

const router = express.Router();

// All routes require admin authentication
router.use(isAdmin);

// Dashboard
router.get("/stats", getDashboardStats);

// Users
router.get("/users", getAllUsers);
router.put("/users/:userId/toggle-block", toggleBlockUser);
router.delete("/users/:userId", deleteUser);

// Shops
router.get("/shops", getAllShops);
router.put("/shops/:shopId/approve", approveShop);
router.put("/shops/:shopId/reject", rejectShop);
router.delete("/shops/:shopId", deleteShop);

export default router;
