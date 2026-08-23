import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-helper";
import { Semester } from "@/models/Semester";
import { AcademicGoal } from "@/models/AcademicGoal";
import { User } from "@/models/User";
import {
  calculateCurrentGPA,
  calculateRequiredGPA,
  calculateCourseTargetSuggestions,
} from "@/lib/gpa-calculator";

// POST /api/gpa/calculate
export async function POST() {
  return withAuth(async (user) => {
    const [semesters, academicGoal, userDoc] = await Promise.all([
      Semester.find({ userId: user.id }).sort({ order: 1 }),
      AcademicGoal.findOne({ userId: user.id }),
      User.findById(user.id),
    ]);

    const targetGPA = academicGoal?.targetGPA ?? 3.5;
    const totalCreditsRequired = academicGoal?.totalCreditsRequired ?? 120;
    const gpaMax = userDoc?.gradeScale?.max ?? 4.0;

    // Flatten courses
    const allCompletedCourses: Array<{
      id?: string;
      name: string;
      credits: number;
      grade?: number | null;
      semesterName?: string;
    }> = [];
    const allPlannedCourses: Array<{
      id?: string;
      name: string;
      credits: number;
      difficulty?: "easy" | "medium" | "hard";
      semesterName?: string;
    }> = [];

    // Track semester by semester progression for trend chart
    const semesterTrends: Array<{
      semesterId: string;
      name: string;
      termCredits: number;
      termGPA: number;
      cumulativeCredits: number;
      cumulativeGPA: number;
    }> = [];

    let runningCredits = 0;
    let runningQualityPoints = 0;

    for (const sem of semesters) {
      let semCredits = 0;
      let semQP = 0;

      for (const course of sem.courses) {
        if (course.grade !== undefined && course.grade !== null && !isNaN(course.grade)) {
          allCompletedCourses.push({
            id: (course as any)._id?.toString(),
            name: course.name,
            credits: course.credits,
            grade: course.grade,
            semesterName: sem.name,
          });
          semCredits += course.credits;
          semQP += course.credits * course.grade;
        } else {
          allPlannedCourses.push({
            id: (course as any)._id?.toString(),
            name: course.name,
            credits: course.credits,
            difficulty: course.difficulty,
            semesterName: sem.name,
          });
        }
      }

      if (semCredits > 0) {
        runningCredits += semCredits;
        runningQualityPoints += semQP;

        semesterTrends.push({
          semesterId: sem._id.toString(),
          name: sem.name,
          termCredits: semCredits,
          termGPA: Number((semQP / semCredits).toFixed(3)),
          cumulativeCredits: runningCredits,
          cumulativeGPA: Number((runningQualityPoints / runningCredits).toFixed(3)),
        });
      }
    }

    const currentStats = calculateCurrentGPA(allCompletedCourses);

    const requirement = calculateRequiredGPA({
      completedCredits: currentStats.completedCredits,
      currentGPA: currentStats.currentGPA,
      totalCreditsRequired,
      targetGPA,
      gpaMax,
    });

    const suggestions = calculateCourseTargetSuggestions({
      plannedCourses: allPlannedCourses,
      qualityPointsRemainingNeeded: requirement.qualityPointsRemainingNeeded,
      remainingCredits: requirement.remainingCredits,
      gpaMax,
    });

    return NextResponse.json({
      summary: requirement,
      semesterTrends,
      suggestions,
      totalCompletedCourses: allCompletedCourses.length,
      totalPlannedCourses: allPlannedCourses.length,
    });
  });
}
