"use client";

import React from "react";
import { useGPA } from "@/hooks/use-gpa";
import { GPASummaryCard } from "@/components/gpa/gpa-summary-card";
import { SemesterForm } from "@/components/gpa/semester-form";
import { GPATrendChart } from "@/components/gpa/gpa-trend-chart";
import { TargetPlanner } from "@/components/gpa/target-planner";

export default function GPAPage() {
  const {
    semesters,
    goal,
    calculation,
    isLoading,
    createSemester,
    updateSemester,
    deleteSemester,
    updateGoal,
  } = useGPA();

  return (
    <div className="space-y-6 pb-20">
      {/* GPA Summary KPI & Goal Card */}
      <GPASummaryCard
        summary={calculation?.summary}
        goal={goal}
        onUpdateGoal={updateGoal}
      />

      {/* Target Floor/Recommended Grades & What-If Simulator */}
      <TargetPlanner
        suggestions={calculation?.suggestions || []}
        semesters={semesters}
        currentGPA={calculation?.summary?.currentGPA || 0}
        completedCredits={calculation?.summary?.completedCredits || 0}
      />

      {/* GPA Trend Chart */}
      <GPATrendChart
        data={calculation?.semesterTrends || []}
        targetGPA={goal?.targetGPA}
      />

      {/* Semesters & Courses List */}
      <SemesterForm
        semesters={semesters}
        onCreateSemester={createSemester}
        onUpdateSemester={updateSemester}
        onDeleteSemester={deleteSemester}
      />
    </div>
  );
}
