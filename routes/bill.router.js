import express from "express";
import * as bill from "../controllers/bill.controller.js";
import auth from "../middlewares/auth.middleware.js";

const route = express.Router();

route.get("/get_bills", auth, bill.getBillByUser);
route.get("/get_all", auth, bill.getAllBills);

export default route;
