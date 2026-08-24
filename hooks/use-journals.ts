"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { JournalDTO } from "@/types";
import { toast } from "sonner";

export function useJournals(params?: { month?: string; page?: number }) {
  const queryClient = useQueryClient();
  const queryKey = ["journals", params];

  const journalsQuery = useQuery<{ journals: JournalDTO[]; pagination: any }>({
    queryKey,
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.month) searchParams.set("month", params.month);
      if (params?.page) searchParams.set("page", params.page.toString());

      const res = await fetch(`/api/journals?${searchParams.toString()}`);
      if (!res.ok) throw new Error("Không thể tải danh sách nhật ký");
      return res.json();
    },
  });

  const createJournalMutation = useMutation({
    mutationFn: async (data: Partial<JournalDTO>) => {
      const res = await fetch("/api/journals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể tạo nhật ký");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journals"] });
      toast.success("Đã lưu nhật ký mới!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const updateJournalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<JournalDTO> }) => {
      const res = await fetch(`/api/journals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Không thể cập nhật nhật ký");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journals"] });
      toast.success("Đã cập nhật nhật ký!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const deleteJournalMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/journals/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Không thể xoá nhật ký");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journals"] });
      toast.success("Đã xoá nhật ký!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return {
    journals: journalsQuery.data?.journals || [],
    pagination: journalsQuery.data?.pagination,
    isLoading: journalsQuery.isLoading,
    isError: journalsQuery.isError,
    createJournal: createJournalMutation.mutateAsync,
    updateJournal: updateJournalMutation.mutateAsync,
    deleteJournal: deleteJournalMutation.mutateAsync,
    isCreating: createJournalMutation.isPending,
  };
}
