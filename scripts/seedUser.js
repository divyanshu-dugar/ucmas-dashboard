import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is missing in environment variables");
  }

  await mongoose.connect(MONGODB_URI);

  const passwordHash = await bcrypt.hash("password123", 12);

  const user = await User.create({
    name: "Test Parent",
    email: "parent@test.com",
    passwordHash,
    role: "parent",
  });

  console.log("User created:", user.email);

  await mongoose.disconnect();
}

seed();
