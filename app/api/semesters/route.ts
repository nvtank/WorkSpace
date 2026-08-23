import { NextRequest, NextResponse } from "next/server";
import { withAuth, serializeDocuments, serializeDocument } from "@/lib/api-helper";
import { Semester } from "@/models/Semester";
import { semesterSchema } from "@/lib/validations/index";

// GET /api/semesters
export async function GET() {
  return withAuth(async (user) => {
    const semesters = await Semester.find({ userId: user.id }).sort({ order: 1, createdAt: 1 });
    return NextResponse.json(serializeDocuments(semesters));
  });
}

// POST /api/semesters
export async function POST(req: NextRequest) {
  return withAuth(async (user) => {
    const body = await req.json();
    const validatedData = semesterSchema.parse(body);

    const highest = await Semester.findOne({ userId: user.id }).sort({ order: -1 });
    const order = validatedData.order || (highest ? highest.order + 1 : 1);

    const newSemester = await Semester.create({
      ...validatedData,
      userId: user.id,
      order,
    });

    return NextResponse.json(serializeDocument(newSemester), { status: 201 });
  });
}
