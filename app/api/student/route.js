import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import Student from "../../../models/Student";
import { connectDB } from "../../../lib/db";
import { NextResponse } from "next/server";

/**
 * GET /api/student
 * Retrieve all students (with batch info populated)
 */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const students = await Student.find()
      .populate("batch", "name schedule")
      .sort({ createdAt: -1 });

    return NextResponse.json(students);
  } catch (error) {
    console.error("Student GET error:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

/**
 * POST /api/student
 * Create a new student and assign to batch
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, dob, level, batch } = await req.json();

    if (!name || !dob || !level || !batch) {
      return NextResponse.json(
        { error: "Name, DOB, level, and batch are required" },
        { status: 400 }
      );
    }

    await connectDB();
    const student = await Student.create({
      name,
      dob: new Date(dob),
      level,
      batch,
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error("Student POST error:", error);
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}

/**
 * PUT /api/student
 * Update an existing student
 */
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { _id, name, dob, level, batch } = await req.json();

    if (!_id) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }

    await connectDB();
    const student = await Student.findByIdAndUpdate(
      _id,
      { name, dob: dob ? new Date(dob) : undefined, level, batch },
      { new: true }
    );

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error("Student PUT error:", error);
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}

/**
 * DELETE /api/student
 * Delete a student
 */
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { _id } = await req.json();

    if (!_id) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }

    await connectDB();
    const student = await Student.findByIdAndDelete(_id);

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Student DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
  }
}
