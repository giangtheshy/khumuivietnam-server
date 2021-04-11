import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true, trim: true, minlength: 5 },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/giangtheshy/image/upload/v1618042500/dev/khumuivietnam/pcwl6uqwzepykmhnpuks.jpg",
    },
    role: { type: Number, default: 0 },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "products" }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("users", userSchema);
