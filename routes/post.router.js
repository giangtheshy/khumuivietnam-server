import express from "express";
import { createPost, getPost, getPosts } from '../controllers/post.controller.js'

const route = express.Router()

route.post('/posts/createPost', createPost)
route.get('/posts/getPost/:title', getPost)
route.get('/posts/getPosts', getPosts)
export default route