import express from "express";
import {
  registerUser,
  loginUser,
  isValidToken,
  deleteUser,
  getUser,
  loginGoogleUser,
  addProductToCart, removeProductFromCart
} from "../controllers/user.controller.js";
import auth from "../middlewares/auth.middleware.js";

const route = express.Router();

route.post("/users/register", registerUser);
route.post("/users/login", loginUser);
route.post("/users/isValidToken", isValidToken);
route.delete("/users/:id", deleteUser);
route.post("/users/loginGoogle", loginGoogleUser);
route.get("/users", auth, getUser);
route.post("/users/addProduct", auth, addProductToCart);
route.delete("/users/removeProduct/:id", auth, removeProductFromCart);

export default route;