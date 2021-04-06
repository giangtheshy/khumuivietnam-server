import express from "express";
import { addToCart, getCarts, removeFromCart, incrementCart, decrementCart } from '../controllers/cart.controller.js'
import auth from '../middlewares/auth.middleware.js';

const route = express.Router()

route.post('/cart/addToCart', auth, addToCart)
route.get('/cart/getCarts', auth, getCarts)
route.delete('/cart/removeFromCart/:id', removeFromCart)
route.patch('/cart/incrementCart/:id', incrementCart)
route.patch('/cart/decrementCart/:id', decrementCart)
export default route