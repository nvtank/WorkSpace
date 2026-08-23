import { NextRequest, NextResponse } from "next/server";
import { withAuth, serializeDocuments, serializeDocument } from "@/lib/api-helper";
import { Task } from "@/models/Task";
import { taskSchema } from "@/lib/validations/task";
import { startOfDay, endOfDay, parseISO } from "date-fns";

// GET /api/tasks?date=...&dateFrom=...&dateTo=...&backlog=...
export async function GET(req: NextRequest) {
  return withAuth(async (user) => {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const backlogOnly = searchParams.get("backlog") === "true";

    const query: any = { userId: user.id };

    if (backlogOnly) {
      query.$or = [{ startTime: null }, { startTime: "" }, { startTime: { $exists: false } }];
    } else if (date) {
      const targetDate = parseISO(date);
      query.date = {
        $gte: startOfDay(targetDate),
        $lte: endOfDay(targetDate),
      };
    } else if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) {
        query.date.$gte = startOfDay(parseISO(dateFrom));
      }
      if (dateTo) {
        query.date.$lte = endOfDay(parseISO(dateTo));
      }
    }

    const tasks = await Task.find(query).sort({ startTime: 1, order: 1, createdAt: 1 });
    return NextResponse.json(serializeDocuments(tasks));
  });
}

// POST /api/tasks
export async function POST(req: NextRequest) {
  return withAuth(async (user) => {
    const body = await req.json();
    const validatedData = taskSchema.parse(body);

    const taskDate =
      typeof validatedData.date === "string"
        ? parseISO(validatedData.date)
        : validatedData.date;

    const newTask = await Task.create({
      ...validatedData,
      userId: user.id,
      date: taskDate,
      recurrenceRule: validatedData.recurrenceRule
        ? {
            ...validatedData.recurrenceRule,
            until: validatedData.recurrenceRule.until
              ? typeof validatedData.recurrenceRule.until === "string"
                ? parseISO(validatedData.recurrenceRule.until)
                : validatedData.recurrenceRule.until
              : undefined,
          }
        : undefined,
    });

    return NextResponse.json(serializeDocument(newTask), { status: 201 });
  });
}
