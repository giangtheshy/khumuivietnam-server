import mongoose from 'mongoose';
import Product from './product.model.js';

const cartSchema = new mongoose.Schema({
  title: String,
  price: Number,
  images: [String],
  inventory: Number,
  createdAt: { type: Number, default: new Date().getTime() },
  productID: { type: mongoose.Schema.Types.ObjectId, ref: "products", required: true },
  quantity: Number,
  UID: { type: String, required: true }
})
export default mongoose.model("carts", cartSchema);