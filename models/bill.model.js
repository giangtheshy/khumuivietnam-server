import mongoose from "mongoose";

const billSchema = mongoose.Schema({
  uid: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  info: { name: String, address: String, phone: Number, email: String, note: String },
  cart: [
    {
      title: String,
      price: Number,
      images: [String],
      inventory: Number,
      createdAt: { type: Number, default: new Date().getTime() },
      productID: { type: mongoose.Schema.Types.ObjectId, ref: "products", required: true },
      quantity: Number,
      UID: { type: String, required: true },
    },
  ],
  status: { type: Boolean, default: false },
});

export default mongoose.model("bills", billSchema);
