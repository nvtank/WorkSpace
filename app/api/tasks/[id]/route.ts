import { NextRequest, NextResponse } from "next/server";
import { withAuth, serializeDocument } from "@/lib/api-helper";
import { Task } from "@/models/Task";
import { taskSchema } from "@/lib/validations/task";
import { parseISO } from "date-fns";

// PATCH /api/tasks/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withAuth(async (user) => {
    const body = await req.json();
    const validatedData = taskSchema.partial().parse(body);

    const updatePayload: any = { ...validatedData };
    if (validatedData.date) {
      updatePayload.date =
        typeof validatedData.date === "string"
          ? parseISO(validatedData.date)
          : validatedData.date;
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, userId: user.id },
      { $set: updatePayload },
      { new: true }
    );

    if (!task) {
      return NextResponse.json({ error: "Task không tồn tại" }, { status: 404 });
    }

    return NextResponse.json(serializeDocument(task));
  });
}

// DELETE /api/tasks/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withAuth(async (user) => {
    const task = await Task.findOneAndDelete({ _id: id, userId: user.id });
    if (!task) {
      return NextResponse.json({ error: "Task không tồn tại" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Đã xoá task" });
  });
}
