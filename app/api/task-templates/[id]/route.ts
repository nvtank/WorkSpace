import { NextRequest, NextResponse } from "next/server";
import { withAuth, serializeDocument } from "@/lib/api-helper";
import { TaskTemplate } from "@/models/TaskTemplate";
import { taskTemplateSchema } from "@/lib/validations/task";

// PATCH /api/task-templates/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withAuth(async (user) => {
    const body = await req.json();
    const validatedData = taskTemplateSchema.partial().parse(body);

    const template = await TaskTemplate.findOneAndUpdate(
      { _id: id, userId: user.id },
      { $set: validatedData },
      { new: true }
    );

    if (!template) {
      return NextResponse.json({ error: "Template không tồn tại" }, { status: 404 });
    }

    return NextResponse.json(serializeDocument(template));
  });
}

// DELETE /api/task-templates/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withAuth(async (user) => {
    const template = await TaskTemplate.findOneAndDelete({ _id: id, userId: user.id });
    if (!template) {
      return NextResponse.json({ error: "Template không tồn tại" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Đã xoá template" });
  });
}
