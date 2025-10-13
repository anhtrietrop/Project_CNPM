import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  addRating,
  getItemRatings,
  deleteRating,
} from "../controllers/rating.controllers.js";

const ratingRouter = express.Router();

ratingRouter.post("/item/:itemId", isAuth, addRating);
ratingRouter.get("/item/:itemId", getItemRatings);
ratingRouter.delete("/:ratingId", isAuth, deleteRating);

export default ratingRouter;
