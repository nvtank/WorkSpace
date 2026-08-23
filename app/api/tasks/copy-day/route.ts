import { NextRequest, NextResponse } from "next/server";
import { withAuth, serializeDocuments } from "@/lib/api-helper";
import { Task } from "@/models/Task";
import { copyDaySchema } from "@/lib/validations/task";
import { startOfDay, endOfDay, parseISO } from "date-fns";

// POST /api/tasks/copy-day
export async function POST(req: NextRequest) {
  return withAuth(async (user) => {
    const body = await req.json();
    const { sourceDate, targetDates, conflictMode } = copyDaySchema.parse(body);

    const srcDateParsed = parseISO(sourceDate);
    const sourceTasks = await Task.find({
      userId: user.id,
      date: {
        $gte: startOfDay(srcDateParsed),
        $lte: endOfDay(srcDateParsed),
      },
    });

    if (sourceTasks.length === 0) {
      return NextResponse.json(
        { error: "Ngày nguồn không có công việc nào để sao chép" },
        { status: 400 }
      );
    }

    const createdTasks: any[] = [];

    for (const targetDateStr of targetDates) {
      const targetDate = parseISO(targetDateStr);

      if (conflictMode === "overwrite") {
        // Delete existing tasks on target date
        await Task.deleteMany({
          userId: user.id,
          date: {
            $gte: startOfDay(targetDate),
            $lte: endOfDay(targetDate),
          },
        });
      }

      for (const srcTask of sourceTasks) {
        // If conflictMode is skip, check if there is an existing task overlapping this time
        if (conflictMode === "skip" && srcTask.startTime) {
          const conflict = await Task.findOne({
            userId: user.id,
            date: {
              $gte: startOfDay(targetDate),
              $lte: endOfDay(targetDate),
            },
            startTime: srcTask.startTime,
          });
          if (conflict) {
            continue; // Skip this task
          }
        }

        const newTask = await Task.create({
          userId: user.id,
          title: srcTask.title,
          description: srcTask.description,
          date: targetDate,
          startTime: srcTask.startTime,
          endTime: srcTask.endTime,
          categoryId: srcTask.categoryId,
          priority: srcTask.priority,
          status: "todo", // New copies start as todo
          color: srcTask.color,
          isRecurring: false,
          reminder: srcTask.reminder,
          subtasks: srcTask.subtasks?.map((st) => ({ title: st.title, done: false })),
          order: srcTask.order,
        });

        createdTasks.push(newTask);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Đã sao chép ${createdTasks.length} công việc sang ${targetDates.length} ngày`,
      tasks: serializeDocuments(createdTasks),
    });
  });
}
