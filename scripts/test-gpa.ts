import {
  calculateCurrentGPA,
  calculateRequiredGPA,
  calculateCourseTargetSuggestions,
  simulateGPA,
} from "../lib/gpa-calculator";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log("=== Running GPA Calculator Tests ===");

// 1. Current GPA calculation
const sampleCourses = [
  { name: "Môn 1", credits: 4, grade: 3.5 },
  { name: "Môn 2", credits: 3, grade: 4.0 },
  { name: "Môn 3", credits: 3, grade: 4.0 },
  { name: "Môn 4", credits: 3, grade: 3.0 },
];
const currentStats = calculateCurrentGPA(sampleCourses);
// total credits = 13, QP = 4*3.5 + 3*4 + 3*4 + 3*3 = 14 + 12 + 12 + 9 = 47. 47/13 = 3.615
assert(currentStats.completedCredits === 13, "completed credits should be 13");
assert(Math.abs(currentStats.currentGPA - 3.615) < 0.01, "current GPA should be ~3.615");

// 2. Specification Example Verification from PROMPT.md §4.5
// "Đã học 60 tín chỉ, GPA hiện tại 3.2 → QualityPoints đã có = 192
//  Tổng toàn khoá 120 tín chỉ, mục tiêu ra trường 3.5 → QualityPoints cần tổng = 420
//  QualityPoints cần từ 60 tín chỉ còn lại = 420 − 192 = 228
//  → Cần đạt trung bình 3.8 cho các môn còn lại (228 / 60)"
const req = calculateRequiredGPA({
  completedCredits: 60,
  currentGPA: 3.2,
  totalCreditsRequired: 120,
  targetGPA: 3.5,
  gpaMax: 4.0,
});

assert(req.qualityPointsEarned === 192, "QualityPoints earned should be 192");
assert(req.qualityPointsTotalNeeded === 420, "QualityPoints total needed should be 420");
assert(req.qualityPointsRemainingNeeded === 228, "QualityPoints remaining needed should be 228");
assert(req.requiredAverageGPA === 3.8, "Required average GPA must be exactly 3.8");
assert(req.isFeasible === true, "Goal 3.5 must be feasible");

// 3. Infeasible Goal Verification
const infeasibleReq = calculateRequiredGPA({
  completedCredits: 100,
  currentGPA: 2.5,
  totalCreditsRequired: 120,
  targetGPA: 3.8,
  gpaMax: 4.0,
});
// earned: 250, total needed: 456, remaining needed: 206 for 20 credits -> avg 10.3 > 4.0
assert(infeasibleReq.isFeasible === false, "Infeasible goal should return isFeasible = false");
assert(infeasibleReq.requiredAverageGPA > 4.0, "Required average should exceed 4.0");

// 4. Floor Grade & Suggestions
const planned = [
  { id: "c1", name: "Môn Khó", credits: 4, difficulty: "hard" as const },
  { id: "c2", name: "Môn Vừa", credits: 3, difficulty: "medium" as const },
  { id: "c3", name: "Môn Dễ", credits: 3, difficulty: "easy" as const },
];
const suggestions = calculateCourseTargetSuggestions({
  plannedCourses: planned,
  qualityPointsRemainingNeeded: 35,
  remainingCredits: 10,
  gpaMax: 4.0,
});
assert(suggestions.length === 3, "Suggestions count should be 3");
assert(suggestions[0].difficulty === "hard", "First course is hard");

// 5. What-if Simulator
const sim = simulateGPA(
  [{ name: "Môn Đã Học", credits: 60, grade: 3.2 }],
  [{ name: "Môn Dự Kiến", credits: 60, grade: 3.8 }]
);
assert(sim.totalCredits === 120, "Simulated total credits should be 120");
assert(Math.abs(sim.projectedGPA - 3.5) < 0.01, "Simulated GPA should be 3.5");

console.log("🎉 All GPA Calculator unit tests passed flawlessly!");
