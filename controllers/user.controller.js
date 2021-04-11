import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendMail from "./sendMail.js";
import { google } from "googleapis";
import fetch from "node-fetch";

import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import cloudinary from "../utils/cloudinary/index.js";

const { OAuth2 } = google.auth;

const client = new OAuth2(process.env.MAILING_SERVICE_CLIENT_ID);

const CLIENT_URL = process.env.NODE_ENV === "production" ? "https://khumuivietnam.com" : process.env.CLIENT_URL;

export const registerUser = async (req, res) => {
  try {
    let { displayName, password, passwordCheck, email, photoURL, role } = req.body;

    if (!password || !email || !passwordCheck)
      return res.status(400).json({ message: "Phải điền đủ email và password" });
    if (password.length < 5) return res.status(400).json({ message: "Độ dài password không thể ít hơn 5" });
    if (password !== passwordCheck) return res.status(400).json({ message: "Password xác nhận không khớp" });
    const existingUser = await User.findOne({ email: email });
    if (existingUser) return res.status(400).json({ message: "Email đã đăng ký trước đó" });
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    if (!displayName) displayName = email;
    let tempRole = 0;
    if (role == 0) {
      tempRole = 0;
    } else if (role == 1) {
      tempRole = 1;
    } else {
      tempRole = 0;
    }
    if (!photoURL) {
      const newUser = new User({
        displayName,
        email,
        password: passwordHash,
        role: tempRole,
      });
      const saveUser = await newUser.save();
      res.status(200).json(saveUser);
    } else {
      const uploadResponse = await cloudinary.uploader.upload(photoURL, {
        upload_preset: "khumuivietnam",
      });
      const newUser = new User({
        displayName,
        email,
        photoURL: uploadResponse.secure_url,
        password: passwordHash,
        role: tempRole,
      });
      const saveUser = await newUser.save();
      res.status(200).json(saveUser);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const userController = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) return res.status(400).json({ message: "Please fill in all fields." });

      if (!validateEmail(email)) return res.status(400).json({ message: "Invalid emails." });

      const user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: "This email already exists." });

      if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

      const passwordHash = await bcrypt.hash(password, 12);

      const newUser = { name, email, password: passwordHash };

      const activation_token = createActivationToken(newUser);

      const url = `${CLIENT_URL}/user/activation/${activation_token}`;

      sendMail(email, url, "Xác minh");

      res.status(200).json({ message: "Register success! Please activate your email to start." });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  activateEmail: async (req, res) => {
    try {
      const { activation_token } = req.body;
      const user = jwt.verify(activation_token, process.env.ACTIVATION_TOKEN_SECRET);

      const { name, email, password } = user;

      const check = await User.findOne({ email });
      if (check) return res.status(400).json({ message: "This email already exists." });

      const newUser = new User({ name, email, password });

      await newUser.save();

      res.status(200).json({ message: "Account has been activated." });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "This email does not exist." });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Password is incorrect." });

      const refresh_token = createRefreshToken({ id: user._id, role: user.role });

      res.cookie("refreshtoken", refresh_token, {
        httpOnly: true,
        path: "/api/user/refresh_token",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production" ? true : false,
      });

      res.status(200).json({ message: "Login successfully." });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getAccessToken: async (req, res) => {
    try {
      const refresh_token = req.cookies.refreshtoken;

      if (!refresh_token) return res.status(400).json({ message: "Haven't token.Please login now!" });

      jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(400).json({ message: "Please login now!" });

        const access_token = createAccessToken({ id: user.id, role: user.role });

        res.status(200).json({ access_token: access_token });
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "This email does not exist." });

      const access_token = createAccessToken({ id: user._id, role: user.role });

      const url = `${CLIENT_URL}/user/reset/${access_token}`;

      sendMail(email, url, "Reset your password");
      res.status(200).json({ message: "Check your email to reset your password." });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  resetPassword: async (req, res) => {
    try {
      const { password } = req.body;

      const passwordHash = await bcrypt.hash(password, 12);
      console.log(req.user.id);
      await User.findByIdAndUpdate(req.user.id, { password: passwordHash });

      res.status(200).json({ message: "Password successfully changed!" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getUserInfo: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password");

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  logout: async (req, res) => {
    try {
      res.clearCookie("refreshtoken", { path: "/api/user/refresh_token" });
      res.status(200).json({ message: "Logged out!" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  updateUser: async (req, res) => {
    try {
      const { name, avatar } = req.body;
      await User.findOneAndUpdate({ _id: req.user.id }, { name, avatar });

      res.status(200).json({ message: "Updated!" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  updateUserRole: async (req, res) => {
    try {
      const { role } = req.body;
      await User.findOneAndUpdate({ _id: req.user.id }, { role });

      res.status(200).json({ message: "Update success!" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  deleteUser: async (req, res) => {
    try {
      await User.findOneAndDelete({ _id: req.params.id });

      res.status(200).json({ message: "Deleted success!" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  googleLogin: async (req, res) => {
    try {
      const { tokenId } = req.body;
      const verify = await client.verifyIdToken({ idToken: tokenId, audience: process.env.MAILING_SERVICE_CLIENT_ID });

      const { email_verified, email, name, picture } = verify.payload;

      const password = email + process.env.GOOGLE_SECRET;

      const passwordHash = await bcrypt.hash(password, 12);

      if (!email_verified) return res.status(400).json({ message: "Email verification failed." });

      const user = await User.findOne({ email });
      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Password is incorrect." });

        const refresh_token = createRefreshToken({ id: user._id });
        res.cookie("refreshtoken", refresh_token, {
          httpOnly: true,
          path: "/api/user/refresh_token",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production" ? true : false,
        });
        res.status(200).json({ message: "Login success!" });
      } else {
        const newUser = new User({ name, email, password: passwordHash, avatar: picture });

        await newUser.save();

        const refresh_token = createRefreshToken({ id: newUser._id });

        res.cookie("refreshtoken", refresh_token, {
          httpOnly: true,
          path: "/api/user/refresh_token",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production" ? true : false,
        });
        res.status(200).json({ message: "Login success!" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  facebookLogin: async (req, res) => {
    try {
      const { accessToken, userID } = req.body;

      const URL = `https://graph.facebook.com/v2.9/${userID}/?fields=id,name,email,picture&access_token=${accessToken}`;

      const data = await fetch(URL)
        .then((res) => res.json())
        .then((res) => res);
      const { email, name, picture } = data;

      const password = email + process.env.FACEBOOK_SECRET;

      const passwordHash = await bcrypt.hash(password, 12);

      const user = await User.findOne({ email });

      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Password is incorrect." });

        const refresh_token = createRefreshToken({ id: user._id });
        res.cookie("refreshtoken", refresh_token, {
          httpOnly: true,
          path: "/api/user/refresh_token",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production" ? true : false,
        });
        res.status(200).json({ message: "Login success!" });
      } else {
        const newUser = new User({ name, email, password: passwordHash, avatar: picture.data.url });
        await newUser.save();

        const refresh_token = createRefreshToken({ id: newUser._id });
        res.cookie("refreshtoken", refresh_token, {
          httpOnly: true,
          path: "/api/user/refresh_token",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production" ? true : false,
        });
        res.status(200).json({ message: "Login success!" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  updateFavorites: async (req, res) => {
    try {
      const productID = req.params.id;
      const id = req.user.id;
      const user = await User.findById(id);
      const product = await Product.findById(productID);
      const existFavorite = user.favorites.find((item) => item.toString() === productID);
      let newUser;
      let newProduct;
      if (existFavorite) {
        newProduct = await Product.findByIdAndUpdate(
          productID,
          { favorites: product.favorites.filter((u) => u.toString() !== id) },
          { new: true }
        );
        newUser = await User.findByIdAndUpdate(
          id,
          { favorites: user.favorites.filter((fav) => fav.toString() !== productID) },
          { new: true }
        );
      } else {
        newUser = await User.findByIdAndUpdate(id, { favorites: [...user.favorites, productID] }, { new: true });
        newProduct = await Product.findByIdAndUpdate(
          productID,
          { favorites: [...product.favorites, id] },
          { new: true }
        );
      }
      res.status(200).json({ favorites: newUser.favorites, product: newProduct });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getFavorites: async (req, res) => {
    try {
      const id = req.user.id;
      console.log(id);
      const combine = await User.aggregate([
        {
          $lookup: {
            from: "products",
            localField: "favorites",
            foreignField: "_id",
            as: "favorites",
          },
        },
      ]);
      const favorites = combine.find((user) => user._id.toString() === id).favorites;
      res.status(200).json(favorites);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

const validateEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};
const createActivationToken = (payload) => jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET, { expiresIn: "5m" });
const createAccessToken = (payload) => jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
const createRefreshToken = (payload) => jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

export default userController;
