import express from "express";
import { createProduct, getProducts, getProduct } from '../controllers/product.controller.js'

const route = express.Router()

route.post('/products/createProduct', createProduct)
route.get('/products/getProduct/:id', getProduct)
route.get('/products/getProducts', getProducts)
export default route