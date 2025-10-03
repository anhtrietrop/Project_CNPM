import express from "express";

import isAuth from "../middlewares/isAuth.js";
import { addItem, editItem } from "../controllers/item.controllers.js";
import { upload } from "../middlewares/multer.js";

const itemRouter = express.Router();

itemRouter.get("/add-item", isAuth, upload.single("image"), addItem);
itemRouter.get("/edit-item/:itemId", isAuth, upload.single("image"), editItem);

export default itemRouter;
