import express from "express";
import * as products from "../controllers/product.controller.js";
import auth from "../middlewares/auth.middleware.js";

const route = express.Router();

route.post("/products/createProduct", auth, products.createProduct);
route.get("/products/getProduct/:id", products.getProduct);
route.patch("/products/updateProduct/:id", auth, products.updateProduct);
route.get("/products/get_unverify", auth, products.getProductsUnVerify);
route.get("/products/verify/:id", auth, products.verifyProduct);
route.delete("/products/removeProduct/:id", auth, products.removeProduct);
route.get("/products/getProducts", products.getProducts);
route.post("/products/search", products.searchProducts);
export default route;
