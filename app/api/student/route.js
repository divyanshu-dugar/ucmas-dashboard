import Student from "../../../models/Student";
import connectDB from "../../../lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  const students = await Student.find().populate("batch");
  return NextResponse.json(students);
}

export async function POST(req) {
  await connectDB();
  const { name, dob, level, batch } = await req.json();
  const student = await Student.create({ name, dob, level, batch });
  return NextResponse.json(student);
}

export async function PUT(req) {
  await connectDB();
  const { _id, name, dob, level, batch } = await req.json();
  const student = await Student.findByIdAndUpdate(_id, { name, dob, level, batch }, { new: true });
  return NextResponse.json(student);
}

export async function DELETE(req) {
  await connectDB();
  const { _id } = await req.json();
  await Student.findByIdAndDelete(_id);
  return NextResponse.json({ success: true });
}
