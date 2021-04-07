import express from "express";
import {
  registerUser,
  loginUser,
  isValidToken,
  deleteUser,
  getUser,
  loginGoogleUser,
  updateFavorites,
  getFavorites
} from "../controllers/user.controller.js";
import auth from "../middlewares/auth.middleware.js";

const route = express.Router();

route.post("/users/register", registerUser);
route.post("/users/login", loginUser);
route.post("/users/isValidToken", isValidToken);
route.delete("/users/:id", deleteUser);
route.post("/users/loginGoogle", loginGoogleUser);
route.get("/users", auth, getUser);
route.patch("/users/updateFavorites/:id", auth, updateFavorites);
route.get("/users/getFavorites", auth, getFavorites);


export default route;