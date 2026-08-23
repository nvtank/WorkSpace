/**
 * Pure GPA Calculation library for Personal Life & Study Hub
 * No React/Next.js dependencies for easy unit testing
 */

export interface CourseInput {
  id?: string;
  name: string;
  credits: number;
  grade?: number | null;
  difficulty?: "easy" | "medium" | "hard";
  status?: "completed" | "planned";
}

export interface SemesterInput {
  id?: string;
  name: string;
  order: number;
  courses: CourseInput[];
}

export interface GPARequirementResult {
  completedCredits: number;
  currentGPA: number;
  qualityPointsEarned: number;
  totalCreditsRequired: number;
  targetGPA: number;
  qualityPointsTotalNeeded: number;
  remainingCredits: number;
  qualityPointsRemainingNeeded: number;
  requiredAverageGPA: number;
  isFeasible: boolean;
  maxPossibleGPA: number;
}

export interface CourseTargetSuggestion {
  courseId?: string;
  name: string;
  credits: number;
  difficulty: "easy" | "medium" | "hard";
  floorGrade: number; // Điểm sàn tối thiểu để còn cơ hội
  suggestedTargetGrade: number; // Điểm đề xuất theo độ khó
}

/**
 * Tính GPA hiện tại từ danh sách môn học đã có điểm
 */
export function calculateCurrentGPA(courses: CourseInput[]): {
  completedCredits: number;
  currentGPA: number;
  qualityPoints: number;
} {
  let completedCredits = 0;
  let qualityPoints = 0;

  for (const c of courses) {
    if (c.grade !== undefined && c.grade !== null && !isNaN(c.grade) && c.credits > 0) {
      completedCredits += c.credits;
      qualityPoints += c.credits * c.grade;
    }
  }

  const currentGPA = completedCredits > 0 ? qualityPoints / completedCredits : 0;

  return {
    completedCredits,
    currentGPA: Number(currentGPA.toFixed(3)),
    qualityPoints: Number(qualityPoints.toFixed(3)),
  };
}

/**
 * Tính yêu cầu GPA cho phần tín chỉ còn lại
 */
export function calculateRequiredGPA(params: {
  completedCredits: number;
  currentGPA: number;
  totalCreditsRequired: number;
  targetGPA: number;
  gpaMax?: number;
}): GPARequirementResult {
  const gpaMax = params.gpaMax ?? 4.0;
  const qualityPointsEarned = params.completedCredits * params.currentGPA;
  const qualityPointsTotalNeeded = params.totalCreditsRequired * params.targetGPA;
  const remainingCredits = Math.max(0, params.totalCreditsRequired - params.completedCredits);
  const qualityPointsRemainingNeeded = Math.max(0, qualityPointsTotalNeeded - qualityPointsEarned);

  let requiredAverageGPA = 0;
  if (remainingCredits > 0) {
    requiredAverageGPA = qualityPointsRemainingNeeded / remainingCredits;
  }

  const isFeasible = requiredAverageGPA <= gpaMax;
  const maxPossibleGPA =
    params.totalCreditsRequired > 0
      ? (qualityPointsEarned + remainingCredits * gpaMax) / params.totalCreditsRequired
      : 0;

  return {
    completedCredits: params.completedCredits,
    currentGPA: Number(params.currentGPA.toFixed(3)),
    qualityPointsEarned: Number(qualityPointsEarned.toFixed(3)),
    totalCreditsRequired: params.totalCreditsRequired,
    targetGPA: params.targetGPA,
    qualityPointsTotalNeeded: Number(qualityPointsTotalNeeded.toFixed(3)),
    remainingCredits,
    qualityPointsRemainingNeeded: Number(qualityPointsRemainingNeeded.toFixed(3)),
    requiredAverageGPA: Number(requiredAverageGPA.toFixed(3)),
    isFeasible,
    maxPossibleGPA: Number(maxPossibleGPA.toFixed(3)),
  };
}

/**
 * Tính điểm sàn và điểm đề xuất theo độ khó cho từng môn học còn lại
 */
export function calculateCourseTargetSuggestions(params: {
  plannedCourses: CourseInput[];
  qualityPointsRemainingNeeded: number;
  remainingCredits: number;
  gpaMax?: number;
}): CourseTargetSuggestion[] {
  const gpaMax = params.gpaMax ?? 4.0;
  const courses = params.plannedCourses.filter((c) => c.credits > 0);

  if (courses.length === 0 || params.remainingCredits <= 0) {
    return [];
  }

  const difficultyWeights: Record<"easy" | "medium" | "hard", number> = {
    easy: 1.15,
    medium: 1.0,
    hard: 0.85,
  };

  // 1. Tính tổng trọng số có nhân tín chỉ
  let weightedCreditsSum = 0;
  for (const c of courses) {
    const diff = c.difficulty || "medium";
    const weight = difficultyWeights[diff];
    weightedCreditsSum += c.credits * weight;
  }

  const avgReq = params.qualityPointsRemainingNeeded / params.remainingCredits;
  const normalizationFactor = weightedCreditsSum > 0 ? (avgReq * params.remainingCredits) / weightedCreditsSum : 1;

  return courses.map((c) => {
    const diff = c.difficulty || "medium";
    const weight = difficultyWeights[diff];

    // Điểm sàn: sàn_i = [QP_còn_lại − GPA_MAX × (tín_chỉ_còn_lại − tín_chỉ_i)] / tín_chỉ_i
    const creditsOthers = Math.max(0, params.remainingCredits - c.credits);
    const rawFloor = (params.qualityPointsRemainingNeeded - gpaMax * creditsOthers) / c.credits;
    const floorGrade = Math.max(0, Math.min(gpaMax, rawFloor));

    // Điểm đề xuất: chuẩn hoá theo độ khó nhưng không vượt quá GPA_MAX
    const rawSuggested = weight * normalizationFactor;
    const suggestedTargetGrade = Math.max(floorGrade, Math.min(gpaMax, rawSuggested));

    return {
      courseId: c.id,
      name: c.name,
      credits: c.credits,
      difficulty: diff,
      floorGrade: Number(floorGrade.toFixed(2)),
      suggestedTargetGrade: Number(suggestedTargetGrade.toFixed(2)),
    };
  });
}

/**
 * What-if Simulator: Tính GPA dự kiến khi thay đổi điểm giả định
 */
export function simulateGPA(
  completedCourses: CourseInput[],
  simulatedCourses: CourseInput[]
): {
  totalCredits: number;
  projectedGPA: number;
} {
  let totalCredits = 0;
  let totalQualityPoints = 0;

  const all = [...completedCourses, ...simulatedCourses];
  for (const c of all) {
    if (c.grade !== undefined && c.grade !== null && !isNaN(c.grade) && c.credits > 0) {
      totalCredits += c.credits;
      totalQualityPoints += c.credits * c.grade;
    }
  }

  const projectedGPA = totalCredits > 0 ? totalQualityPoints / totalCredits : 0;

  return {
    totalCredits,
    projectedGPA: Number(projectedGPA.toFixed(3)),
  };
}
