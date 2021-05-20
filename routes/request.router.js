import express from "express";
import * as request from "../controllers/request.controller.js";
import auth from "../middlewares/auth.middleware.js";

const route = express.Router();

route.post("/create", request.createRequest);
route.get("/confirm/:id", auth, request.confirmRequest);
route.get("/get_all", auth, request.getAllRequest);
route.delete("/delete/:id", auth, request.deleteRequest);

export default route;
