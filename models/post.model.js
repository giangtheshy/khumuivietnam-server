
import mongoose from "mongoose";

const filmSchema = mongoose.Schema({
  title: String,
  description: String,
  introduce: String,
  image: String,
  parseLink: String,
  contents: [{ title: String, content: [{ heading: String, text: String, image: String, link: String }] }],
  createdAt: { type: Number, default: new Date().getTime() },
});

export default mongoose.model("posts", filmSchema);