import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import Batch from "../../../models/Batch";
import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * GET /api/batch
 * Retrieve all batches for the authenticated instructor
 */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const batches = await Batch.find({ instructor: session.user.id })
      .populate("students")
      .sort({ createdAt: -1 });

    return NextResponse.json(batches);
  } catch (error) {
    console.error("Batch GET error:", error);
    return NextResponse.json({ error: "Failed to fetch batches" }, { status: 500 });
  }
}

/**
 * POST /api/batch
 * Create a new batch
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "instructor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, schedule } = await req.json();

    if (!name || !schedule) {
      return NextResponse.json(
        { error: "Name and schedule are required" },
        { status: 400 }
      );
    }

    await connectDB();
    const batch = await Batch.create({
      name,
      schedule,
      instructor: session.user.id,
    });

    return NextResponse.json(batch, { status: 201 });
  } catch (error) {
    console.error("Batch POST error:", error);
    return NextResponse.json({ error: "Failed to create batch" }, { status: 500 });
  }
}

/**
 * PUT /api/batch
 * Update an existing batch
 */
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "instructor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { _id, name, schedule, students } = await req.json();

    if (!_id) {
      return NextResponse.json({ error: "Batch ID is required" }, { status: 400 });
    }

    await connectDB();
    const batch = await Batch.findByIdAndUpdate(
      _id,
      { name, schedule, students },
      { new: true }
    );

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    return NextResponse.json(batch);
  } catch (error) {
    console.error("Batch PUT error:", error);
    return NextResponse.json({ error: "Failed to update batch" }, { status: 500 });
  }
}

/**
 * DELETE /api/batch
 * Delete a batch
 */
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "instructor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { _id } = await req.json();

    if (!_id) {
      return NextResponse.json({ error: "Batch ID is required" }, { status: 400 });
    }

    await connectDB();
    const batch = await Batch.findByIdAndDelete(_id);

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Batch DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete batch" }, { status: 500 });
  }
}
