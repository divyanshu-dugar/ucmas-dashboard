import mongoose from "mongoose";

const BatchSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Saturday 9am-11am"
  schedule: { type: String, required: true }, // e.g. "Sat 9:00-11:00"
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export default mongoose.models.Batch || mongoose.model("Batch", BatchSchema);
