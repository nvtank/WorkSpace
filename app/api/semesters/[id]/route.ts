import { NextRequest, NextResponse } from "next/server";
import { withAuth, serializeDocument } from "@/lib/api-helper";
import { Semester } from "@/models/Semester";
import { semesterSchema } from "@/lib/validations/index";

// PATCH /api/semesters/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withAuth(async (user) => {
    const body = await req.json();
    const validatedData = semesterSchema.partial().parse(body);

    const semester = await Semester.findOneAndUpdate(
      { _id: id, userId: user.id },
      { $set: validatedData },
      { new: true }
    );

    if (!semester) {
      return NextResponse.json({ error: "Học kỳ không tồn tại" }, { status: 404 });
    }

    return NextResponse.json(serializeDocument(semester));
  });
}

// DELETE /api/semesters/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withAuth(async (user) => {
    const semester = await Semester.findOneAndDelete({ _id: id, userId: user.id });
    if (!semester) {
      return NextResponse.json({ error: "Học kỳ không tồn tại" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Đã xoá học kỳ" });
  });
}
