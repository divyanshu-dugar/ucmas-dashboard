import Batch from "../../../models/Batch";
import connectDB from "../../../lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  const batches = await Batch.find().populate("students");
  return NextResponse.json(batches);
}

export async function POST(req) {
  await connectDB();
  const { name, schedule, instructor } = await req.json();
  const batch = await Batch.create({ name, schedule, instructor });
  return NextResponse.json(batch);
}

export async function PUT(req) {
  await connectDB();
  const { _id, name, schedule, students } = await req.json();
  const batch = await Batch.findByIdAndUpdate(_id, { name, schedule, students }, { new: true });
  return NextResponse.json(batch);
}

export async function DELETE(req) {
  await connectDB();
  const { _id } = await req.json();
  await Batch.findByIdAndDelete(_id);
  return NextResponse.json({ success: true });
}
