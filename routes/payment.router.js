import express from "express";
import * as payment from "../controllers/payment.controller.js";
import auth from "../middlewares/auth.middleware.js";

const route = express.Router();

route.post("/create", auth, payment.createPayment);
route.get("/vnpay_return", payment.returnPayment);
route.get("/vnpay_ipn", payment.inpPayment);

export default route;
