import mongoose from "mongoose";

const RowSchema = new mongoose.Schema(
  {
    row: {
      type: String,
      enum: ["A", "B", "C", "D", "E"],
      required: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 10,
      required: true,
    },
    comments: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const ListeningSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  weekStart: {
    type: Date,
    required: true,
  },

  weekEnd: {
    type: Date,
    required: true,
  },

  rows: {
    type: [RowSchema],
    default: [],
    validate: [arr => arr.length <= 5, "Max 5 rows per week"],
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure one week per student
ListeningSchema.index({ student: 1, weekStart: 1 }, { unique: true });

export default mongoose.models.Listening ||
  mongoose.model("Listening", ListeningSchema);
