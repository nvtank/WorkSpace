import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-helper";
import { Semester } from "@/models/Semester";
import { AcademicGoal } from "@/models/AcademicGoal";
import { User } from "@/models/User";
import {
  calculateAcademicStats,
  calculateRequiredGPA,
  calculateCourseTargetSuggestions,
} from "@/lib/gpa-calculator";

// POST /api/gpa/calculate
export async function POST() {
  return withAuth(async (user) => {
    const [semesters, academicGoal, userDoc] = await Promise.all([
      Semester.find({ userId: user.id }).sort({ order: 1, createdAt: 1 }),
      AcademicGoal.findOne({ userId: user.id }),
      User.findById(user.id),
    ]);

    const targetGPA = academicGoal?.targetGPA ?? 3.5;
    const totalCreditsRequired = academicGoal?.totalCreditsRequired ?? 126;
    const gpaMax = userDoc?.gradeScale?.max ?? 4.0;

    // Convert Mongoose documents to SemesterInput structure
    const semestersData = semesters.map((sem) => ({
      id: sem._id.toString(),
      name: sem.name,
      order: sem.order,
      courses: (sem.courses || []).map((c: any) => ({
        id: c._id?.toString(),
        name: c.name,
        credits: c.credits,
        grade: c.grade,
        difficulty: c.difficulty,
        status: c.status,
      })),
    }));

    // Calculate full academic stats with retake deduplication and VKU scale
    const stats = calculateAcademicStats(semestersData);

    const requirement = calculateRequiredGPA({
      completedCredits: stats.completedCredits,
      currentGPA: stats.currentGPA,
      qualityPointsEarned: stats.qualityPointsEarned,
      totalCreditsRequired,
      targetGPA,
      gpaMax,
    });

    const suggestions = calculateCourseTargetSuggestions({
      plannedCourses: stats.allPlannedCourses,
      qualityPointsRemainingNeeded: requirement.qualityPointsRemainingNeeded,
      remainingCredits: requirement.remainingCredits,
      gpaMax,
    });

    return NextResponse.json({
      summary: requirement,
      semesterTrends: stats.semesterTrends,
      suggestions,
      totalCompletedCourses: stats.uniqueCompletedCourses.length,
      totalPlannedCourses: stats.allPlannedCourses.length,
    });
  });
}
