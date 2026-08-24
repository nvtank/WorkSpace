/**
 * Pure GPA Calculation library for Personal Life & Study Hub
 * Standardized for VKU / Vietnam-Korea University of ICT / MOET credit regulations
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

/**
 * Chuẩn hoá tên môn học để so sánh học lại/thay thế điểm
 */
export function normalizeCourseName(name: string): string {
  if (!name) return "";
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[!]+$/, "")
    .trim();
}

/**
 * Chuyển điểm thang 10 sang thang 4 theo chuẩn VKU / ĐH Đà Nẵng (A/B/C/D/F):
 *   8.5 – 10.0  → 4.0 (A)
 *   7.0 – 8.4   → 3.0 (B)
 *   5.5 – 6.9   → 2.0 (C)
 *   4.0 – 5.4   → 1.0 (D)
 *   < 4.0       → 0.0 (F)
 * Nếu điểm đã <= 4.0 thì giữ nguyên.
 */
export function normalizeGrade10To4(grade: number): number {
  if (grade <= 4.0) return grade;
  if (grade >= 8.5) return 4.0;
  if (grade >= 7.0) return 3.0;
  if (grade >= 5.5) return 2.0;
  if (grade >= 4.0) return 1.0;
  return 0.0;
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
  floorGrade: number;
  suggestedTargetGrade: number;
}

export interface SemesterTrend {
  semesterId: string;
  name: string;
  termCredits: number;
  termGPA: number;
  cumulativeCredits: number;
  cumulativeGPA: number;
}

/**
 * Tính toán toàn bộ GPA học kỳ và GPA tích luỹ xử lý môn học lại theo chuẩn VKU
 */
export function calculateAcademicStats(semesters: SemesterInput[]): {
  completedCredits: number;
  currentGPA: number;
  qualityPointsEarned: number;
  uniqueCompletedCourses: CourseInput[];
  allPlannedCourses: CourseInput[];
  semesterTrends: SemesterTrend[];
} {
  const sortedSemesters = [...semesters].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  
  // Lưu môn học tích luỹ: courseKey -> CourseInput (lần học sau cùng sẽ thay thế lần học trước)
  const cumulativeCoursesMap = new Map<string, CourseInput>();
  const semesterTrends: SemesterTrend[] = [];
  const allPlannedCourses: CourseInput[] = [];

  for (const sem of sortedSemesters) {
    let termCredits = 0;
    let termQualityPoints = 0;

    for (const c of sem.courses || []) {
      if (c.grade !== undefined && c.grade !== null && !isNaN(c.grade) && c.credits > 0) {
        const grade4 = normalizeGrade10To4(c.grade);
        termCredits += c.credits;
        termQualityPoints += c.credits * grade4;

        // Lưu vào pool tích luỹ (môn học lại thay thế điểm cũ)
        const key = normalizeCourseName(c.name);
        cumulativeCoursesMap.set(key, {
          ...c,
          grade: grade4,
        });
      } else if (c.credits > 0) {
        allPlannedCourses.push({
          ...c,
        });
      }
    }

    if (termCredits > 0) {
      const termGPA = Number((termQualityPoints / termCredits).toFixed(2));
      
      // Tính GPA tích luỹ tính đến hết kỳ này
      let cumCredits = 0;
      let cumQP = 0;
      for (const course of cumulativeCoursesMap.values()) {
        cumCredits += course.credits;
        cumQP += course.credits * (course.grade ?? 0);
      }
      const cumulativeGPA = cumCredits > 0 ? Number((cumQP / cumCredits).toFixed(2)) : 0;

      semesterTrends.push({
        semesterId: sem.id || sem.name,
        name: sem.name,
        termCredits,
        termGPA,
        cumulativeCredits: cumCredits,
        cumulativeGPA,
      });
    }
  }

  const uniqueCompletedCourses = Array.from(cumulativeCoursesMap.values());
  let completedCredits = 0;
  let qualityPointsEarned = 0;
  for (const c of uniqueCompletedCourses) {
    completedCredits += c.credits;
    qualityPointsEarned += c.credits * (c.grade ?? 0);
  }
  const currentGPA = completedCredits > 0 ? Number((qualityPointsEarned / completedCredits).toFixed(2)) : 0;

  return {
    completedCredits,
    currentGPA,
    qualityPointsEarned: Number(qualityPointsEarned.toFixed(2)),
    uniqueCompletedCourses,
    allPlannedCourses,
    semesterTrends,
  };
}

/**
 * Tính yêu cầu GPA cho phần tín chỉ còn lại
 */
export function calculateRequiredGPA(params: {
  completedCredits: number;
  currentGPA: number;
  qualityPointsEarned?: number;
  totalCreditsRequired: number;
  targetGPA: number;
  gpaMax?: number;
}): GPARequirementResult {
  const gpaMax = params.gpaMax ?? 4.0;
  const qualityPointsEarned = params.qualityPointsEarned ?? (params.completedCredits * params.currentGPA);
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
    currentGPA: Number(params.currentGPA.toFixed(2)),
    qualityPointsEarned: Number(qualityPointsEarned.toFixed(2)),
    totalCreditsRequired: params.totalCreditsRequired,
    targetGPA: params.targetGPA,
    qualityPointsTotalNeeded: Number(qualityPointsTotalNeeded.toFixed(2)),
    remainingCredits,
    qualityPointsRemainingNeeded: Number(qualityPointsRemainingNeeded.toFixed(2)),
    requiredAverageGPA: Number(requiredAverageGPA.toFixed(2)),
    isFeasible,
    maxPossibleGPA: Number(maxPossibleGPA.toFixed(2)),
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

    const creditsOthers = Math.max(0, params.remainingCredits - c.credits);
    const rawFloor = (params.qualityPointsRemainingNeeded - gpaMax * creditsOthers) / c.credits;
    const floorGrade = Math.max(0, Math.min(gpaMax, rawFloor));

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
 * What-if Simulator: Tính GPA dự kiến khi thay đổi điểm giả định (hỗ trợ thay thế điểm học lại)
 */
export function simulateGPA(
  completedCourses: CourseInput[],
  simulatedCourses: CourseInput[]
): {
  totalCredits: number;
  projectedGPA: number;
} {
  const map = new Map<string, CourseInput>();

  for (const c of completedCourses) {
    if (c.grade !== undefined && c.grade !== null && !isNaN(c.grade) && c.credits > 0) {
      const grade4 = normalizeGrade10To4(c.grade);
      const key = normalizeCourseName(c.name);
      map.set(key, { ...c, grade: grade4 });
    }
  }

  for (const c of simulatedCourses) {
    if (c.grade !== undefined && c.grade !== null && !isNaN(c.grade) && c.credits > 0) {
      const grade4 = normalizeGrade10To4(c.grade);
      const key = normalizeCourseName(c.name);
      map.set(key, { ...c, grade: grade4 });
    }
  }

  let totalCredits = 0;
  let totalQualityPoints = 0;

  for (const c of map.values()) {
    totalCredits += c.credits;
    totalQualityPoints += c.credits * (c.grade ?? 0);
  }

  const projectedGPA = totalCredits > 0 ? totalQualityPoints / totalCredits : 0;

  return {
    totalCredits,
    projectedGPA: Number(projectedGPA.toFixed(2)),
  };
}

