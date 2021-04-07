import express from "express";
import { createProduct, getProducts, getProduct, searchProducts } from '../controllers/product.controller.js'
import auth from '../middlewares/auth.middleware.js';

const route = express.Router()

route.post('/products/createProduct', auth, createProduct)
route.get('/products/getProduct/:id', getProduct)
route.get('/products/getProducts', getProducts)
route.post('/products/search', searchProducts)
export default route