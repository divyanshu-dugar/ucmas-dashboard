// Seed script for test users
// Usage: node scripts/seedUser.js

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Seed the database with a test student and instructor.
 * Student has a classDay (Saturday) and level (Basic).
 * Instructor is a simple test user.
 */
async function seed() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is missing in environment variables");
  }

  await mongoose.connect(MONGODB_URI);

  // Hash passwords for security
  const studentHash = await bcrypt.hash("student123", 12);
  const instructorHash = await bcrypt.hash("test1234", 12);

  // Create test student
  const student = await User.create({
    name: "Test Student",
    email: "student@test.com",
    passwordHash: studentHash,
    role: "student",
    level: "Basic",
    classDay: 6, // Saturday
  });

  // Create test instructor
  const instructor = await User.create({
    name: "Test Instructor",
    email: "instructor@example.com",
    passwordHash: instructorHash,
    role: "instructor",
  });

  // Log seeded users
  console.log("Seeded users:", student.email, instructor.email);

  await mongoose.disconnect();
}

seed();
