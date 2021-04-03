import express from "express";
import {
  registerUser,
  loginUser,
  isValidToken,
  deleteUser,
  getUser,
  loginGoogleUser,
} from "../controllers/user.controller.js";
import auth from "../middlewares/auth.middleware.js";

const route = express.Router();

route.post("/users/register", registerUser);
route.post("/users/login", loginUser);
route.post("/users/isValidToken", isValidToken);
route.delete("/users/:id", deleteUser);
route.get("/users", auth, getUser);
// route.get("/users/logout", logoutUser);
route.post("/users/loginGoogle", loginGoogleUser);

export default route;