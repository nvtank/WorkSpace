"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TaskDTO, TaskTemplateDTO } from "@/types";
import { toast } from "sonner";

export function useTasks(params?: {
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  backlog?: boolean;
}) {
  const queryClient = useQueryClient();
  const queryKey = ["tasks", params];

  const tasksQuery = useQuery<TaskDTO[]>({
    queryKey,
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.date) searchParams.set("date", params.date);
      if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom);
      if (params?.dateTo) searchParams.set("dateTo", params.dateTo);
      if (params?.backlog) searchParams.set("backlog", "true");

      const res = await fetch(`/api/tasks?${searchParams.toString()}`);
      if (!res.ok) throw new Error("Không thể tải danh sách công việc");
      return res.json();
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: Partial<TaskDTO>) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể tạo task");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Đã thêm công việc mới!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TaskDTO> }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể cập nhật task");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Không thể xoá task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Đã xoá công việc!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const copyDayMutation = useMutation({
    mutationFn: async (payload: {
      sourceDate: string;
      targetDates: string[];
      conflictMode: "skip" | "overwrite" | "keep_both";
    }) => {
      const res = await fetch("/api/tasks/copy-day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể sao chép ngày");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(data.message || "Đã sao chép công việc thành công!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return {
    tasks: tasksQuery.data || [],
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
    refetch: tasksQuery.refetch,
    createTask: createTaskMutation.mutateAsync,
    updateTask: updateTaskMutation.mutateAsync,
    deleteTask: deleteTaskMutation.mutateAsync,
    copyDay: copyDayMutation.mutateAsync,
    isCopying: copyDayMutation.isPending,
  };
}

export function useTaskTemplates() {
  const queryClient = useQueryClient();

  const templatesQuery = useQuery<TaskTemplateDTO[]>({
    queryKey: ["task-templates"],
    queryFn: async () => {
      const res = await fetch("/api/task-templates");
      if (!res.ok) throw new Error("Không thể tải danh sách template");
      return res.json();
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (data: Partial<TaskTemplateDTO>) => {
      const res = await fetch("/api/task-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể tạo template");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-templates"] });
      toast.success("Đã lưu template thành công!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const applyTemplateMutation = useMutation({
    mutationFn: async ({ templateId, targetDate }: { templateId: string; targetDate: string }) => {
      const res = await fetch(`/api/task-templates/${templateId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetDate }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể áp dụng template");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(data.message || "Đã áp dụng template!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/task-templates/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Không thể xoá template");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-templates"] });
      toast.success("Đã xoá template!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return {
    templates: templatesQuery.data || [],
    isLoading: templatesQuery.isLoading,
    createTemplate: createTemplateMutation.mutateAsync,
    applyTemplate: applyTemplateMutation.mutateAsync,
    deleteTemplate: deleteTemplateMutation.mutateAsync,
    isApplying: applyTemplateMutation.isPending,
  };
}
