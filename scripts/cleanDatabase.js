import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import User from "../models/User.js";
import Listening from "../models/Listening.js";
import Batch from "../models/Batch.js";

const MONGODB_URI = process.env.MONGODB_URI;

async function clean() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is missing in environment variables");
  }

  await mongoose.connect(MONGODB_URI);

  await User.deleteMany({});
  await Listening.deleteMany({});
  await Batch.deleteMany({});

  console.log("Database cleaned successfully.");

  await mongoose.disconnect();
}

clean();
