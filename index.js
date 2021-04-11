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

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: process.env.NODE_ENV === "production" ? "https://khumuivietnam.com" : "http://localhost:3000",
  })
);
app.use(morgan("tiny"));
app.use("/api", productRouter);
app.use("/api", postRouter);
app.use("/api/user", userRouter);
app.use("/api", cartRouter);

app.get("/", (req, res) => {
  res.send("Welcome to backend web!");
});

connection
  .then(() => app.listen(PORT, () => console.log(`server run on localhost:${PORT}`)))
  .catch((err) => {
    console.log(err);
  });
