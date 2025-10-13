import express from "express";

import isAuth from "../middlewares/isAuth.js";
import {
  addItem,
  deleteItem,
  editItem,
  getItemsById,
  getSuggestedItems,
  searchItems,
  getItemsByCategory,
} from "../controllers/item.controllers.js";
import { upload } from "../middlewares/multer.js";

const itemRouter = express.Router();

itemRouter.post("/add-item", isAuth, upload.single("image"), addItem);
itemRouter.post("/edit-item/:itemId", isAuth, upload.single("image"), editItem);
itemRouter.get("/get-by-id/:itemId", isAuth, getItemsById);
itemRouter.get("/suggested", getSuggestedItems);
itemRouter.get("/search", searchItems);
itemRouter.get("/category/:category", getItemsByCategory);
itemRouter.delete("/delete/:itemId", isAuth, deleteItem);
export default itemRouter;
