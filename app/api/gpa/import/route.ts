import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-helper";
import { Semester } from "@/models/Semester";
import { z } from "zod";

const courseSchema = z.object({
  name: z.string().min(1),
  credits: z.number().min(0),
  grade: z.number().min(0).max(10).nullable().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  status: z.enum(["completed", "planned"]),
});

const semesterSchema = z.object({
  name: z.string().min(1),
  order: z.number().optional(),
  courses: z.array(courseSchema),
});

const importSchema = z.object({
  semesters: z.array(semesterSchema),
  replaceAll: z.boolean().default(false),
});

// POST /api/gpa/import - Import semesters from JSON
export async function POST(req: NextRequest) {
  return withAuth(async (user) => {
    try {
      const body = await req.json();
      const validatedData = importSchema.parse(body);

      // If replaceAll is true, delete all existing semesters
      if (validatedData.replaceAll) {
        await Semester.deleteMany({ userId: user.id });
      }

      // Create semesters with auto-incrementing order if not provided
      const existingCount = await Semester.countDocuments({ userId: user.id });
      let currentOrder = existingCount;

      const createdSemesters = [];
      for (const semData of validatedData.semesters) {
        const semester = await Semester.create({
          userId: user.id,
          name: semData.name,
          order: semData.order ?? currentOrder++,
          courses: semData.courses,
        });
        createdSemesters.push(semester);
      }

      return NextResponse.json({
        success: true,
        message: `Đã import ${createdSemesters.length} học kỳ`,
        count: createdSemesters.length,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "Dữ liệu JSON không hợp lệ",
            details: error.errors,
          },
          { status: 400 }
        );
      }
      throw error;
    }
  });
}
