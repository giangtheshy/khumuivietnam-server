
import mongoose from "mongoose";

const filmSchema = mongoose.Schema({
  title: String,
  category: String,
  brand: String,
  price: Number,
  country: String,
  fragrant: String,
  capacity: String,
  uses: String,
  otherInfo: String,
  images: [String],
  awaiting: { type: String, default: "true" },
  evaluate: Number,
  inventory: Number,
  UID: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  favorites: [mongoose.Schema.Types.ObjectId],
  sold: { type: Number, default: 0 },
  guaranteed: Number,
  createdAt: { type: Number, default: new Date().getTime() },
});

export default mongoose.model("products", filmSchema);