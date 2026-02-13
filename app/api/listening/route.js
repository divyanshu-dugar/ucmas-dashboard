import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Listening from "@/models/Listening";
import User from "@/models/User";

/* ===================== GET ===================== */
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  // Allow instructor-style access: ?student=<id>
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("student") || session.user.id;

  const weeks = await Listening.find({ student: studentId })
    .sort({ weekStart: -1 })
    .populate("student", "name")
    .lean();

  return NextResponse.json(weeks);
}

/* ===================== POST ===================== */
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { row, score, comments, weekStart, weekEnd } = body;

  const parsedScore = Number(score);

  if (
    !["A", "B", "C", "D", "E"].includes(row) ||
    Number.isNaN(parsedScore) ||
    parsedScore < 0 ||
    parsedScore > 10
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  await connectDB();

  const student = await User.findById(session.user.id);
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  /* -------- Week Calculation -------- */
  let start = weekStart ? new Date(weekStart) : null;
  let end = weekEnd ? new Date(weekEnd) : null;

  if (!start || !end) {
    const classDay =
      typeof student.classDay === "number" ? student.classDay : 6; // Saturday default

    const today = new Date();
    const diff = (today.getDay() - classDay + 7) % 7;

    start = new Date(today);
    start.setDate(today.getDate() - diff);
    start.setHours(0, 0, 0, 0);

    end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  }

  /* -------- Find or Create Week -------- */
  let week = await Listening.findOne({
    student: student._id,
    weekStart: { $gte: start, $lte: end },
  });

  if (!week) {
    week = await Listening.create({
      student: student._id,
      weekStart: start,
      weekEnd: end,
      rows: [],
      createdBy: session.user.id,
    });
  }

  /* -------- Validation -------- */
  if (week.rows.some(r => r.row === row)) {
    return NextResponse.json(
      { error: "Row already exists for this week" },
      { status: 409 }
    );
  }

  if (week.rows.length >= 5) {
    return NextResponse.json(
      { error: "Maximum 5 rows per week" },
      { status: 400 }
    );
  }

  week.rows.push({
    row,
    score: parsedScore,
    comments: comments?.trim() || "",
  });

  await week.save();

  return NextResponse.json(week, { status: 201 });
}
