"use client";

import React, { useState } from "react";
import { CourseTargetSuggestion, simulateGPA } from "@/lib/gpa-calculator";
import { SemesterDTO } from "@/types";
import { Sparkles, Calculator, HelpCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TargetPlannerProps {
  suggestions: CourseTargetSuggestion[];
  semesters: SemesterDTO[];
  currentGPA: number;
  completedCredits: number;
}

export function TargetPlanner({
  suggestions,
  semesters,
  currentGPA,
  completedCredits,
}: TargetPlannerProps) {
  // Simulator hypothetical grades map: courseId -> hypotheticalGrade
  const [simulatedGrades, setSimulatedGrades] = useState<Record<string, number>>({});

  // Planned courses list
  const plannedCourses = React.useMemo(() => {
    const list: Array<{ id: string; name: string; credits: number; semName: string }> = [];
    semesters.forEach((sem) => {
      sem.courses.forEach((c) => {
        if (c.grade === undefined || c.grade === null) {
          list.push({
            id: c.id,
            name: c.name,
            credits: c.credits,
            semName: sem.name,
          });
        }
      });
    });
    return list;
  }, [semesters]);

  // Client-side simulation
  const simulationResult = React.useMemo(() => {
    const completedList: Array<{ name: string; credits: number; grade: number }> = [];
    semesters.forEach((sem) => {
      sem.courses.forEach((c) => {
        if (c.grade !== undefined && c.grade !== null) {
          completedList.push({ name: c.name, credits: c.credits, grade: c.grade });
        }
      });
    });

    const simulatedList: Array<{ name: string; credits: number; grade: number }> = [];
    plannedCourses.forEach((c) => {
      if (simulatedGrades[c.id] !== undefined) {
        simulatedList.push({ name: c.name, credits: c.credits, grade: simulatedGrades[c.id] });
      }
    });

    return simulateGPA(completedList, simulatedList);
  }, [semesters, plannedCourses, simulatedGrades]);

  const handleGradeChange = (courseId: string, val: number | "") => {
    setSimulatedGrades((prev) => {
      const next = { ...prev };
      if (val === "") {
        delete next[courseId];
      } else {
        next[courseId] = val;
      }
      return next;
    });
  };

  const handleResetSimulator = () => {
    setSimulatedGrades({});
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Box 1: Course Target Recommendations (Sàn & Đề Xuất) */}
      <div className="card-base bg-surface p-6 border border-hairline shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-hairline">
          <div className="w-8 h-8 rounded-lg bg-canvas-lavender text-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-ink">Gợi Ý Điểm Cho Môn Dự Kiến</h3>
            <p className="text-xs text-ink-mute">
              Điểm sàn tối thiểu & điểm mục tiêu tối ưu theo độ khó
            </p>
          </div>
        </div>

        {suggestions.length === 0 ? (
          <div className="py-8 text-center text-xs text-ink-mute bg-canvas-cream/30 rounded-xl">
            Không có môn học dự kiến nào cần tính toán
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-canvas-cream/50 rounded-lg text-xs text-ink-mute flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <span>
                <strong>Điểm sàn:</strong> Mức điểm thấp nhất môn đó có thể nhận mà vẫn còn cơ hội đạt mục tiêu (khi các môn khác đạt 4.0).
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {suggestions.map((s, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-hairline bg-canvas hover:border-primary/40 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <h4 className="font-bold text-ink">{s.name}</h4>
                    <span className="text-[11px] text-ink-mute">
                      {s.credits} tín chỉ • Độ khó:{" "}
                      <span className="font-semibold capitalize">
                        {s.difficulty === "hard"
                          ? "Khó (×0.85)"
                          : s.difficulty === "easy"
                          ? "Dễ (×1.15)"
                          : "Vừa (×1.0)"}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <span className="text-[10px] text-ink-mute block">Điểm sàn</span>
                      <span className="font-bold text-semantic-error">
                        ≥ {s.floorGrade.toFixed(2)}
                      </span>
                    </div>

                    <div className="pl-2 border-l border-hairline">
                      <span className="text-[10px] text-ink-mute block">Đề xuất</span>
                      <span className="font-bold text-primary text-sm">
                        {s.suggestedTargetGrade.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Box 2: What-If Simulator */}
      <div className="card-base bg-surface p-6 border border-hairline shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-hairline">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-canvas-lavender text-primary flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-ink">What-If Simulator</h3>
              <p className="text-xs text-ink-mute">
                Thử nghiệm điểm giả định xem GPA toàn khoá thay đổi ra sao
              </p>
            </div>
          </div>

          {Object.keys(simulatedGrades).length > 0 && (
            <button
              type="button"
              onClick={handleResetSimulator}
              className="text-xs text-primary font-bold hover:underline"
            >
              Đặt lại
            </button>
          )}
        </div>

        {/* Simulator Live Result Display */}
        <div className="p-4 rounded-xl bg-canvas-cream/60 border border-hairline flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-mute block">
              GPA Dự Kiến Sau Giả Định
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-primary tracking-tight mt-0.5">
              {simulationResult.projectedGPA.toFixed(2)} / 4.0
            </div>
            <p className="text-[11px] text-ink-mute">
              Tính trên {simulationResult.totalCredits} tín chỉ
            </p>
          </div>

          <div className="text-right text-xs">
            <span className="text-ink-mute block">GPA Hiện Tại:</span>
            <span className="font-bold text-ink">{currentGPA.toFixed(2)}</span>
            <div className="flex items-center gap-1 font-bold mt-1 text-primary">
              <ArrowRight className="w-3.5 h-3.5" />
              <span>
                {simulationResult.projectedGPA >= currentGPA ? "+" : ""}
                {(simulationResult.projectedGPA - currentGPA).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Inputs for Planned Courses */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {plannedCourses.length === 0 ? (
            <div className="py-6 text-center text-xs text-ink-mute bg-canvas-cream/30 rounded-xl">
              Thêm các môn dự kiến ở danh sách học kỳ để kích hoạt mô phỏng
            </div>
          ) : (
            plannedCourses.map((c) => (
              <div
                key={c.id}
                className="p-2.5 rounded-lg border border-hairline bg-canvas flex items-center justify-between gap-3 text-xs"
              >
                <div className="truncate flex-1">
                  <h5 className="font-bold text-ink truncate">{c.name}</h5>
                  <span className="text-[10px] text-ink-mute">
                    {c.semName} • {c.credits} tín chỉ
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-ink-mute">Điểm thử:</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="4.0"
                    value={simulatedGrades[c.id] ?? ""}
                    onChange={(e) =>
                      handleGradeChange(
                        c.id,
                        e.target.value !== "" ? parseFloat(e.target.value) : ""
                      )
                    }
                    placeholder="—"
                    className="w-16 text-center input-base py-1 px-1 text-xs font-bold text-primary"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
