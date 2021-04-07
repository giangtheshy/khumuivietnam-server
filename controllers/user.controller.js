import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/user.model.js";
import Product from '../models/product.model.js';
import cloudinary from '../utils/cloudinary/index.js';

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
      .json({ token, user: { displayName: newUser.displayName, photoURL: newUser.photoURL, _id: newUser._id, role: newUser.role, favorites: newUser.favorites, } });
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
    if (!user) return res.status(400).json({ message: "Tài khoản không tồn tại hoặc sai email, password!" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: " Email or password incorrect" });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.status(200).json({
      token, user:
      {
        displayName: user.displayName,
        photoURL: user.photoURL,
        _id: user._id,
        role: user.role,
        favorites: user.favorites,
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
    // const combine = await User.aggregate([
    //   {
    //     $lookup: {
    //       from: "products",
    //       localField: "cart.productID",
    //       foreignField: "_id",
    //       as: "cart",
    //     },

    //   },

    // ])
    // const combine = await User.aggregate([
    //   {
    //     $lookup:
    //     {
    //       from: "products",
    //       let: { cart: "$cart", num: "$cart.quantity" },
    //       pipeline: [
    //         {
    //           $match:
    //           {
    //             $expr:
    //             {
    //               $eq: ["$inventory", 10]
    //               // $eq: ["$_id", "$$cart.productID"]

    //             }
    //           }

    //         },
    //       ],
    //       as: "cartList"
    //     }
    //   }
    // ])
    const user = await User.findById(id)
    res.status(200).json({ displayName: user.displayName, photoURL: user.photoURL, _id: user._id, favorites: user.favorites, role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const updateFavorites = async (req, res) => {
  try {
    const productID = req.params.id
    const id = req.user
    const user = await User.findById(id)
    const product = await Product.findById(productID)
    const existFavorite = user.favorites.find(item => item.toString() === productID)
    let newUser
    let newProduct
    if (existFavorite) {
      newProduct = await Product.findByIdAndUpdate(productID, { favorites: product.favorites.filter(u => u.toString() !== id) }, { new: true })
      newUser = await User.findByIdAndUpdate(id, { favorites: user.favorites.filter(fav => fav.toString() !== productID) }, { new: true })
    } else {
      newUser = await User.findByIdAndUpdate(id, { favorites: [...user.favorites, productID] }, { new: true });
      newProduct = await Product.findByIdAndUpdate(productID, { favorites: [...product.favorites, id] }, { new: true })
    }
    res.status(200).json({ favorites: newUser.favorites, product: newProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
export const getFavorites = async (req, res) => {
  try {
    const id = req.user
    const combine = await User.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "favorites",
          foreignField: "_id",
          as: "favorites",
        },

      },

    ])
    const favorites = combine.find(user => user._id.toString() === id).favorites
    res.status(200).json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}