// /models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    classDay: {
    type: Number, // 0 = Sun ... 6 = Sat
    required: true,
    },
    role: {
      type: String,
      enum: ["parent", "instructor"],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);
