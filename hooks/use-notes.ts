"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NoteDTO } from "@/types";
import { toast } from "sonner";

export function useNotes(params?: { tag?: string; search?: string; page?: number }) {
  const queryClient = useQueryClient();
  const queryKey = ["notes", params];

  const notesQuery = useQuery<{ notes: NoteDTO[]; pagination: any }>({
    queryKey,
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.tag) searchParams.set("tag", params.tag);
      if (params?.search) searchParams.set("search", params.search);
      if (params?.page) searchParams.set("page", params.page.toString());

      const res = await fetch(`/api/notes?${searchParams.toString()}`);
      if (!res.ok) throw new Error("Không thể tải danh sách ghi chú");
      return res.json();
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: async (data: Partial<NoteDTO>) => {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể tạo ghi chú");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Đã lưu ghi chú mới!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<NoteDTO> }) => {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Không thể cập nhật ghi chú");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Đã cập nhật ghi chú!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Không thể xoá ghi chú");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Đã xoá ghi chú!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return {
    notes: notesQuery.data?.notes || [],
    pagination: notesQuery.data?.pagination,
    isLoading: notesQuery.isLoading,
    isError: notesQuery.isError,
    createNote: createNoteMutation.mutateAsync,
    updateNote: updateNoteMutation.mutateAsync,
    deleteNote: deleteNoteMutation.mutateAsync,
    isCreating: createNoteMutation.isPending,
  };
}
