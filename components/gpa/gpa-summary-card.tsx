"use client";

import React, { useState } from "react";
import { GPARequirementResult } from "@/lib/gpa-calculator";
import { AcademicGoalDTO } from "@/types";
import {
  GraduationCap,
  Target,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GPASummaryCardProps {
  summary?: GPARequirementResult;
  goal?: AcademicGoalDTO;
  onUpdateGoal: (data: { targetGPA: number; totalCreditsRequired: number }) => Promise<any>;
}

export function GPASummaryCard({
  summary,
  goal,
  onUpdateGoal,
}: GPASummaryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [targetGPA, setTargetGPA] = useState(goal?.targetGPA || 3.5);
  const [totalCredits, setTotalCredits] = useState(goal?.totalCreditsRequired || 120);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onUpdateGoal({
        targetGPA: Number(targetGPA),
        totalCreditsRequired: Number(totalCredits),
      });
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercent = summary
    ? Math.min(
        100,
        Math.round((summary.completedCredits / (summary.totalCreditsRequired || 1)) * 100)
      )
    : 0;

  return (
    <div className="card-base bg-surface p-6 border border-hairline shadow-sm space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-sm flex-shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
              Bảng Điều Khiển GPA & Lộ Trình Tốt Nghiệp
            </h2>
            <p className="text-xs sm:text-sm text-ink-mute mt-0.5">
              Sinh viên VKU: Nguyễn Văn Tuấn Anh • Mục tiêu toàn khoá: <strong className="text-primary">{goal?.targetGPA || 3.5} / 4.0</strong> ({goal?.totalCreditsRequired || 126} tín chỉ)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="btn-secondary inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Edit2 className="w-4 h-4" />
          <span>{isEditing ? "Đóng sửa mục tiêu" : "Chỉnh sửa mục tiêu"}</span>
        </button>
      </div>

      {/* Edit Goal Form */}
      {isEditing && (
        <form
          onSubmit={handleSaveGoal}
          className="p-4 bg-canvas-cream/50 rounded-xl border border-hairline space-y-3 animate-in fade-in"
        >
          <h4 className="font-bold text-xs uppercase tracking-wider text-ink">
            Cập nhật mục tiêu tốt nghiệp
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                GPA mục tiêu khi ra trường (hệ 4.0)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4.0"
                required
                value={targetGPA}
                onChange={(e) => setTargetGPA(parseFloat(e.target.value))}
                className="input-base text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Tổng số tín chỉ toàn khoá
              </label>
              <input
                type="number"
                min="1"
                required
                value={totalCredits}
                onChange={(e) => setTotalCredits(parseInt(e.target.value, 10))}
                className="input-base text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn-outline-compact text-xs"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary-compact text-xs"
            >
              {isSubmitting ? "Đang lưu..." : "Cập nhật mục tiêu"}
            </button>
          </div>
        </form>
      )}

      {/* 4 Big KPI Stat Boxes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Current GPA */}
        <div className="p-4 rounded-xl bg-canvas-cream/60 border border-hairline">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-mute block mb-1">
            GPA Hiện Tại
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
            {summary ? summary.currentGPA.toFixed(2) : "0.00"}
          </div>
          <p className="text-[11px] text-ink-mute mt-1">
            Đã tích luỹ {summary?.completedCredits || 0} tín chỉ
          </p>
        </div>

        {/* KPI 2: Target GPA */}
        <div className="p-4 rounded-xl bg-canvas-lavender/50 border border-hairline">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-mute block mb-1">
            GPA Mục Tiêu
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
            {summary ? summary.targetGPA.toFixed(2) : "3.50"}
          </div>
          <p className="text-[11px] text-ink-mute mt-1">
            Còn lại {summary?.remainingCredits || 0} tín chỉ
          </p>
        </div>

        {/* KPI 3: Required Average for remaining */}
        <div
          className={cn(
            "p-4 rounded-xl border",
            summary?.isFeasible
              ? "bg-canvas-cream/60 border-hairline"
              : "bg-semantic-error/10 border-semantic-error/40"
          )}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-mute block mb-1">
            Cần Đạt Trung Bình
          </span>
          <div
            className={cn(
              "text-2xl sm:text-3xl font-bold tracking-tight",
              summary?.isFeasible ? "text-primary" : "text-semantic-error"
            )}
          >
            {summary ? summary.requiredAverageGPA.toFixed(2) : "0.00"}
          </div>
          <p className="text-[11px] text-ink-mute mt-1">
            Cho các môn còn lại
          </p>
        </div>

        {/* KPI 4: Max Possible GPA */}
        <div className="p-4 rounded-xl bg-canvas-cream/60 border border-hairline">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-mute block mb-1">
            GPA Tối Đa Có Thể Đạt
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
            {summary ? summary.maxPossibleGPA.toFixed(2) : "4.00"}
          </div>
          <p className="text-[11px] text-ink-mute mt-1">
            Nếu đạt 4.0 toàn bộ môn còn lại
          </p>
        </div>
      </div>

      {/* Progress Bar & Feasibility Alert Banner */}
      <div className="space-y-3 pt-2">
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-ink mb-1.5">
            <span>Tiến độ hoàn thành tín chỉ toàn khoá</span>
            <span>
              {summary?.completedCredits || 0}/{summary?.totalCreditsRequired || 120} tín chỉ ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-3 bg-canvas-cream rounded-full overflow-hidden border border-hairline">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {summary && !summary.isFeasible && (
          <div className="p-4 rounded-xl bg-semantic-error/10 border border-semantic-error/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-semantic-error flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-semantic-error">
                Cảnh báo: Mục tiêu {summary.targetGPA.toFixed(2)} KHÔNG khả thi!
              </h4>
              <p className="text-xs text-ink mt-0.5 leading-relaxed">
                Với số tín chỉ còn lại ({summary.remainingCredits} tín chỉ), bạn cần đạt trung bình{" "}
                <span className="font-bold">{summary.requiredAverageGPA.toFixed(2)}</span> (vượt quá GPA tối đa 4.0).
                Mức GPA cao nhất bạn có thể đạt được khi tốt nghiệp là{" "}
                <span className="font-bold text-semantic-error">{summary.maxPossibleGPA.toFixed(2)}</span>.
              </p>
            </div>
          </div>
        )}

        {summary && summary.isFeasible && summary.completedCredits > 0 && (
          <div className="p-3.5 rounded-xl bg-semantic-success/10 border border-semantic-success/30 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-semantic-success flex-shrink-0" />
            <p className="text-xs font-semibold text-semantic-success">
              Kế hoạch hoàn toàn khả thi! Hãy duy trì điểm trung bình các kỳ tới từ{" "}
              {summary.requiredAverageGPA.toFixed(2)} trở lên.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
