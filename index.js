import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import connection from "./database/connection.js";
import productRouter from "./routes/product.router.js";
import postRouter from "./routes/post.router.js";
import userRouter from "./routes/user.router.js";
import cartRouter from "./routes/cart.router.js";
import paymentRouter from "./routes/payment.router.js";
import billRouter from "./routes/bill.router.js";
import requestRouter from "./routes/request.router.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

app.set("trust proxy", 1);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.json());
app.use(
  cors({
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    origin: process.env.NODE_ENV === "production" ? "https://ananas.ml" : "http://localhost:3000",
  })
);
app.use(morgan("tiny"));
app.use("/api", productRouter);
app.use("/api", postRouter);
app.use("/api/user", userRouter);
app.use("/api", cartRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/bill", billRouter);
app.use("/api/request", requestRouter);

app.get("/", (req, res) => {
  res.send("Welcome to backend web!");
});

connection
  .then(() => app.listen(PORT, () => console.log(`server run on localhost:${PORT}`)))
  .catch((err) => {
    console.log(err);
  });
