import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import bodyParser from "body-parser";

import connection from "./database/connection.js";
import productRouter from './routes/product.router.js'

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));
app.use('/api', productRouter)

app.get("/", (req, res) => {
  res.send("Welcome to backend web!");
});

connection
  .then(() => app.listen(PORT, () => console.log(`server run on localhost:${PORT}`)))
  .catch((err) => {
    console.log(err);
  });
