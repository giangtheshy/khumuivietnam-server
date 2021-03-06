import express from "express";

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
router.get("/get_all", auth, userController.getAllUsers);
router.get("/logout", userController.logout);
router.patch("/update", auth, userController.updateUser);
router.patch("/update_avatar", auth, userController.updateUserAvatar);
router.post("/update_role/:id", auth, userController.updateUserRole);
router.delete("/delete/:id", auth, userController.deleteUser);
router.post("/google_login", userController.googleLogin);
router.post("/facebook_login", userController.facebookLogin);
router.patch("/updateFavorites/:id", auth, userController.updateFavorites);
router.get("/getFavorites", auth, userController.getFavorites);

export default router;
