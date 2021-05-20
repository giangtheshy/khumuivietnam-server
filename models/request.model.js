import mongoose from "mongoose";

const requestSchema = mongoose.Schema({
  uid: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  email: String,
  name: String,
});

export default mongoose.model("requests", requestSchema);
