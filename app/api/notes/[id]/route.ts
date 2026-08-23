import { NextRequest, NextResponse } from "next/server";
import { withAuth, serializeDocument } from "@/lib/api-helper";
import { Note } from "@/models/Note";
import { noteSchema } from "@/lib/validations/index";

// PATCH /api/notes/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withAuth(async (user) => {
    const body = await req.json();
    const validatedData = noteSchema.partial().parse(body);

    const note = await Note.findOneAndUpdate(
      { _id: id, userId: user.id },
      { $set: validatedData },
      { new: true }
    );

    if (!note) {
      return NextResponse.json({ error: "Note không tồn tại" }, { status: 404 });
    }

    return NextResponse.json(serializeDocument(note));
  });
}

// DELETE /api/notes/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withAuth(async (user) => {
    const note = await Note.findOneAndDelete({ _id: id, userId: user.id });
    if (!note) {
      return NextResponse.json({ error: "Note không tồn tại" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Đã xoá note" });
  });
}
