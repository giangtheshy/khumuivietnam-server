import express from "express";
import { createProduct, getProducts, getProduct, searchProducts, updateProduct, removeProduct } from '../controllers/product.controller.js'
import auth from '../middlewares/auth.middleware.js';

const route = express.Router()

route.post('/products/createProduct', auth, createProduct)
route.get('/products/getProduct/:id', getProduct)
route.patch('/products/updateProduct/:id', auth, updateProduct)
route.delete('/products/removeProduct/:id', auth, removeProduct)
route.get('/products/getProducts', getProducts)
route.post('/products/search', searchProducts)
export default route