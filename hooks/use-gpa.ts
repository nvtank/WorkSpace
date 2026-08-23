"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SemesterDTO, AcademicGoalDTO } from "@/types";
import { GPARequirementResult, CourseTargetSuggestion } from "@/lib/gpa-calculator";
import { toast } from "sonner";

export interface GPACalculateResponse {
  summary: GPARequirementResult;
  semesterTrends: Array<{
    semesterId: string;
    name: string;
    termCredits: number;
    termGPA: number;
    cumulativeCredits: number;
    cumulativeGPA: number;
  }>;
  suggestions: CourseTargetSuggestion[];
  totalCompletedCourses: number;
  totalPlannedCourses: number;
}

export function useGPA() {
  const queryClient = useQueryClient();

  const semestersQuery = useQuery<SemesterDTO[]>({
    queryKey: ["semesters"],
    queryFn: async () => {
      const res = await fetch("/api/semesters");
      if (!res.ok) throw new Error("Không thể tải danh sách học kỳ");
      return res.json();
    },
  });

  const goalQuery = useQuery<AcademicGoalDTO>({
    queryKey: ["academic-goal"],
    queryFn: async () => {
      const res = await fetch("/api/gpa/goal");
      if (!res.ok) throw new Error("Không thể tải mục tiêu học tập");
      return res.json();
    },
  });

  const calculateQuery = useQuery<GPACalculateResponse>({
    queryKey: ["gpa-calculation"],
    queryFn: async () => {
      const res = await fetch("/api/gpa/calculate", { method: "POST" });
      if (!res.ok) throw new Error("Không thể tính toán GPA");
      return res.json();
    },
  });

  const createSemesterMutation = useMutation({
    mutationFn: async (data: Partial<SemesterDTO>) => {
      const res = await fetch("/api/semesters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Không thể tạo học kỳ");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["semesters"] });
      queryClient.invalidateQueries({ queryKey: ["gpa-calculation"] });
      toast.success("Đã thêm học kỳ mới!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const updateSemesterMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SemesterDTO> }) => {
      const res = await fetch(`/api/semesters/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Không thể cập nhật học kỳ");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["semesters"] });
      queryClient.invalidateQueries({ queryKey: ["gpa-calculation"] });
      toast.success("Đã lưu thay đổi học kỳ!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const deleteSemesterMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/semesters/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Không thể xoá học kỳ");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["semesters"] });
      queryClient.invalidateQueries({ queryKey: ["gpa-calculation"] });
      toast.success("Đã xoá học kỳ!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async (data: { targetGPA: number; totalCreditsRequired: number }) => {
      const res = await fetch("/api/gpa/goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Không thể cập nhật mục tiêu");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-goal"] });
      queryClient.invalidateQueries({ queryKey: ["gpa-calculation"] });
      toast.success("Đã cập nhật mục tiêu GPA!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return {
    semesters: semestersQuery.data || [],
    goal: goalQuery.data,
    calculation: calculateQuery.data,
    isLoading: semestersQuery.isLoading || goalQuery.isLoading || calculateQuery.isLoading,
    createSemester: createSemesterMutation.mutateAsync,
    updateSemester: updateSemesterMutation.mutateAsync,
    deleteSemester: deleteSemesterMutation.mutateAsync,
    updateGoal: updateGoalMutation.mutateAsync,
  };
}
