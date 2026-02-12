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

  const studentHash = await bcrypt.hash("student123", 12);
  const instructorHash = await bcrypt.hash("test1234", 12);

  const student = await User.create({
    name: "Test Student",
    email: "student@test.com",
    passwordHash: studentHash,
    role: "student",
  });

  const instructor = await User.create({
    name: "Test Instructor",
    email: "instructor@example.com",
    passwordHash: instructorHash,
    role: "instructor",
  });

  console.log("Seeded users:", student.email, instructor.email);

  await mongoose.disconnect();
}

seed();
