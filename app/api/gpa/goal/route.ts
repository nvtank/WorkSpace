import { NextRequest, NextResponse } from "next/server";
import { withAuth, serializeDocument } from "@/lib/api-helper";
import { AcademicGoal } from "@/models/AcademicGoal";
import { academicGoalSchema } from "@/lib/validations/index";

// GET /api/gpa/goal
export async function GET() {
  return withAuth(async (user) => {
    let goal = await AcademicGoal.findOne({ userId: user.id });
    if (!goal) {
      goal = await AcademicGoal.create({
        userId: user.id,
        targetGPA: 3.5,
        totalCreditsRequired: 120,
      });
    }
    return NextResponse.json(serializeDocument(goal));
  });
}

// POST /api/gpa/goal
export async function POST(req: NextRequest) {
  return withAuth(async (user) => {
    const body = await req.json();
    const validatedData = academicGoalSchema.parse(body);

    const goal = await AcademicGoal.findOneAndUpdate(
      { userId: user.id },
      { $set: validatedData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(serializeDocument(goal));
  });
}
