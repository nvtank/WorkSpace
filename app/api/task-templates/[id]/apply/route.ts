import { NextRequest, NextResponse } from "next/server";
import { withAuth, serializeDocuments } from "@/lib/api-helper";
import { TaskTemplate } from "@/models/TaskTemplate";
import { Task } from "@/models/Task";
import { parseISO } from "date-fns";

// POST /api/task-templates/[id]/apply
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withAuth(async (user) => {
    const body = await req.json();
    const { targetDate } = body;

    if (!targetDate) {
      return NextResponse.json({ error: "Thiếu ngày áp dụng (targetDate)" }, { status: 400 });
    }

    const template = await TaskTemplate.findOne({ _id: id, userId: user.id });
    if (!template) {
      return NextResponse.json({ error: "Template không tồn tại" }, { status: 404 });
    }

    const dateParsed = parseISO(targetDate);
    const createdTasks = [];

    for (const t of template.tasks) {
      const newTask = await Task.create({
        userId: user.id,
        title: t.title,
        description: t.description,
        date: dateParsed,
        startTime: t.startTime,
        endTime: t.endTime,
        categoryId: t.categoryId,
        priority: t.priority || "medium",
        status: "todo",
        color: t.color,
        isRecurring: false,
        templateId: template._id,
        reminder: t.reminder,
        subtasks: t.subtasks?.map((st) => ({ title: st.title, done: false })),
        order: t.order || 0,
      });
      createdTasks.push(newTask);
    }

    return NextResponse.json({
      success: true,
      message: `Đã áp dụng template "${template.name}" (${createdTasks.length} công việc)`,
      tasks: serializeDocuments(createdTasks),
    });
  });
}
