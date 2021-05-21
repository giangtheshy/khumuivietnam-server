import express from "express";
import { createPost, getPost, getPosts, removePost, updatePost } from "../controllers/post.controller.js";
import auth from "../middlewares/auth.middleware.js";

const route = express.Router();

route.post("/posts/createPost", auth, createPost);
route.get("/posts/getPost/:title", getPost);
route.delete("/posts/delete/:id", auth, removePost);
route.patch("/posts/update", auth, updatePost);
route.get("/posts/getPosts", getPosts);
export default route;
