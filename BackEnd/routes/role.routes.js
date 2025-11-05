import express from "express";
import {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
} from "../controllers/role.controllers.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

// Tạo role mới (chỉ admin)
router.post("/create", isAuth, createRole);

// Lấy tất cả roles
router.get("/", getAllRoles);

// Lấy role theo ID
router.get("/:roleId", getRoleById);

// Cập nhật role (chỉ admin)
router.put("/:roleId", isAuth, updateRole);

// Xóa role (chỉ admin)
router.delete("/:roleId", isAuth, deleteRole);

export default router;

