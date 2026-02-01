import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Listening from "@/models/Listening";
import User from "@/models/User";
import { getWeekRange } from "@/lib/week";

/* ===================== GET ===================== */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const weeks = await Listening.find({ student: session.user.id }).sort({
    weekStart: -1,
  });

  return NextResponse.json(weeks);
}

/* ===================== POST ===================== */
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { row, score, comments } = await req.json();

  if (
    !["A", "B", "C", "D", "E"].includes(row) ||
    Number.isNaN(score) ||
    score < 0 ||
    score > 10
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  await connectDB();

  const student = await User.findById(session.user.id);
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  if (student.classDay === undefined || student.classDay === null) {
    return NextResponse.json(
      { error: "Student class day not set" },
      { status: 400 },
    );
  }

  const classDay = Number(student.classDay);
  if (Number.isNaN(classDay) || classDay < 0 || classDay > 6) {
    return NextResponse.json(
      { error: "Invalid class day configuration" },
      { status: 400 },
    );
  }

  const { weekStart, weekEnd } = getWeekRange(classDay);

  let week = await Listening.findOne({
    student: student._id,
    weekStart: {
      $gte: weekStart,
      $lte: weekEnd,
    },
  });

  if (!week) {
    week = await Listening.create({
      student: student._id,
      weekStart,
      weekEnd,
      rows: [],
      createdBy: session.user.id,
    });
  }

  // Prevent duplicate rows
  if (week.rows.some((r) => r.row === row)) {
    return NextResponse.json(
      { error: "Row already exists for this week" },
      { status: 409 },
    );
  }

  if (week.rows.length >= 5) {
    return NextResponse.json({ error: "Max 5 rows per week" }, { status: 400 });
  }

  week.rows.push({
    row,
    score,
    comments: comments || "",
  });

  await week.save();

  return NextResponse.json(week, { status: 201 });
}
