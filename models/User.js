// /models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "instructor"],
      required: true,
    },
    // Student-specific fields
    dob: { type: Date },
    level: {
      type: String,
      enum: ["Elementary A", "Basic", "Junior 1", "Junior 2", "Intermediate", "Senior"],
    },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch" },
    classDay: {
      type: Number, // 0 = Sunday, 6 = Saturday
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);
