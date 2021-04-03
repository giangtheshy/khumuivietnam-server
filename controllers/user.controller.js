import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/user.model.js";
import cloudinary from '../utils/cloudinary/index.js';

export const registerUser = async (req, res) => {
  try {
    let { displayName, password, passwordCheck, email, photoURL, role } = req.body;

    if (!password || !email || !passwordCheck)
      return res.status(400).json({ message: "email and password must fill in" });
    if (password.length < 5) return res.status(400).json({ message: "password length can't least than 5" });
    if (password !== passwordCheck) return res.status(400).json({ message: "password different password confirm" });
    const existingUser = await User.findOne({ email: email });
    if (existingUser) return res.status(400).json({ message: "this email already exists" });
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    if (!displayName) displayName = email;
    let tempRole = 0;
    if (role == 0) {
      tempRole = 0
    } else if (role == 1) {
      tempRole = 1;
    } else { tempRole = 0 }
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
        upload_preset: 'khumuivietnam',
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
export const loginGoogleUser = async (req, res) => {
  try {
    const { email, imageUrl, name, googleId } = req.body;
    const existing = await User.findOne({ id: googleId });
    let newUser;
    if (!existing) {
      newUser = new User({
        id: googleId,
        email: `Email Google:${email}`,
        photoURL: imageUrl,
        displayName: name,
        password: googleId,
      });
      newUser.save();
    } else {
      newUser = await User.findByIdAndUpdate(existing._id, { displayName: name, photoURL: imageUrl }, { new: true });
    }
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET);

    res
      .status(200)
      .json({ token, user: { displayName: newUser.displayName, photoURL: newUser.photoURL, _id: newUser._id, role: newUser.role, } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "must fill in email and password to login" });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "user not exist may be email or password incorrect" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: " email or password incorrect" });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.status(200).json({
      token, user:
      {
        displayName: user.displayName,
        photoURL: user.photoURL,
        _id: user._id,
        role: user.role,
      }

    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const isValidToken = async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.status(400).send(false);
    const verify = jwt.verify(token, process.env.JWT_SECRET);
    if (!verify) return res.status(400).send(false);
    const user = await User.findById(verify.id);
    if (!user) return res.status(400).send(false);
    res.status(200).json(true);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(400).json({ message: "No user  be deleted." });
    res.status(200).json({ displayName: deletedUser.displayName, email: deletedUser.email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getUser = async (req, res) => {
  try {
    const id = req.user;
    const user = await User.findById(id);
    res.status(200).json({ displayName: user.displayName, photoURL: user.photoURL, _id: user._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// export const logoutUser = async (req, res) => {

//   try {
//     if (req.cookies['auth-token']) {
//       res.clearCookie('auth-token')
//       res.status(200).json(true)
//     } else { res.status(400).json({ message: "Không tồn tại tài khoản!" }) }

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// }