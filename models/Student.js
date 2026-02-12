import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  level: {
    type: String,
    enum: ["Junior 1", "Junior 2", "Junior 3", "Basic", "Elementary A", "Elementary B", "Intermediate A", "Intermediate B", "Higher A", "Higher B", "Advance", "Grand"],
    required: true,
  },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch" },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch" },
}, { timestamps: true });

export default mongoose.models.Student || mongoose.model("Student", StudentSchema);
