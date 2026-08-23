import { NextRequest, NextResponse } from "next/server";
import { withAuth, serializeDocuments, serializeDocument } from "@/lib/api-helper";
import { TaskTemplate } from "@/models/TaskTemplate";
import { taskTemplateSchema } from "@/lib/validations/task";

// GET /api/task-templates
export async function GET() {
  return withAuth(async (user) => {
    const templates = await TaskTemplate.find({ userId: user.id }).sort({ createdAt: -1 });
    return NextResponse.json(serializeDocuments(templates));
  });
}

// POST /api/task-templates
export async function POST(req: NextRequest) {
  return withAuth(async (user) => {
    const body = await req.json();
    const validatedData = taskTemplateSchema.parse(body);

    const newTemplate = await TaskTemplate.create({
      ...validatedData,
      userId: user.id,
    });

    return NextResponse.json(serializeDocument(newTemplate), { status: 201 });
  });
}
