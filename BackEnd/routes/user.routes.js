import express from "express";
import { getCurrentUser, deleteUser } from "../controllers/user.controllers.js";
import isAuth from "../middlewares/isAuth.js";
const userRouter = express.Router();

userRouter.get("/current", isAuth, getCurrentUser);
userRouter.delete("/delete", isAuth, deleteUser);

export default userRouter;
