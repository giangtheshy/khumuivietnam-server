import express from "express";
// import {
//   registerUser,
//   loginUser,
//   isValidToken,
//   deleteUser,
//   getUser,
//   loginGoogleUser,
//   updateFavorites,
//   getFavorites,
// } from "../controllers/user.controller.js";
import userController from "../controllers/user.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", userController.register);
router.post("/activate_email", userController.activateEmail);
router.post("/login", userController.login);
router.get("/refresh_token", userController.getAccessToken);
router.post("/forgot", userController.forgotPassword);
router.post("/reset", auth, userController.resetPassword);
router.get("/info", auth, userController.getUserInfo);
router.get("/logout", userController.logout);
router.get("/update", auth, userController.updateUser);
router.get("/update_role", auth, userController.updateUserRole);
router.get("/delete/:id", auth, userController.deleteUser);
router.post("/google_login", userController.googleLogin);
router.post("/facebook_login", userController.facebookLogin);
router.patch("/updateFavorites/:id", auth, userController.updateFavorites);
router.get("/getFavorites", auth, userController.getFavorites);

// route.post("/register", registerUser);
// route.post("/login", loginUser);
// route.post("/isValidToken", isValidToken);
// route.delete("/:id", deleteUser);
// route.post("/loginGoogle", loginGoogleUser);
// route.get("/", auth, getUser);

export default router;
