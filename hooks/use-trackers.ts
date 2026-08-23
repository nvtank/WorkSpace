"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TrackerDTO, TrackerEntryDTO } from "@/types";
import { toast } from "sonner";

export function useTrackers() {
  const queryClient = useQueryClient();

  const trackersQuery = useQuery<TrackerDTO[]>({
    queryKey: ["trackers"],
    queryFn: async () => {
      const res = await fetch("/api/trackers");
      if (!res.ok) throw new Error("Không thể tải danh sách trackers");
      return res.json();
    },
  });

  const createTrackerMutation = useMutation({
    mutationFn: async (data: Partial<TrackerDTO>) => {
      const res = await fetch("/api/trackers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể tạo tracker");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trackers"] });
      toast.success("Đã tạo tracker mới!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const updateTrackerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TrackerDTO> }) => {
      const res = await fetch(`/api/trackers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể cập nhật tracker");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trackers"] });
      toast.success("Đã cập nhật tracker!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const deleteTrackerMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/trackers/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Không thể xoá tracker");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trackers"] });
      toast.success("Đã lưu trữ tracker!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const reorderTrackersMutation = useMutation({
    mutationFn: async (orders: Array<{ id: string; order: number }>) => {
      const res = await fetch("/api/trackers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders }),
      });
      if (!res.ok) throw new Error("Không thể lưu vị trí trackers");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trackers"] });
    },
  });

  return {
    trackers: trackersQuery.data || [],
    isLoading: trackersQuery.isLoading,
    isError: trackersQuery.isError,
    createTracker: createTrackerMutation.mutateAsync,
    updateTracker: updateTrackerMutation.mutateAsync,
    deleteTracker: deleteTrackerMutation.mutateAsync,
    reorderTrackers: reorderTrackersMutation.mutateAsync,
  };
}

export function useTrackerEntries(params?: { trackerId?: string; from?: string; to?: string }) {
  const queryClient = useQueryClient();
  const queryKey = ["tracker-entries", params];

  const entriesQuery = useQuery<TrackerEntryDTO[]>({
    queryKey,
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.trackerId) searchParams.set("trackerId", params.trackerId);
      if (params?.from) searchParams.set("from", params.from);
      if (params?.to) searchParams.set("to", params.to);

      const res = await fetch(`/api/tracker-entries?${searchParams.toString()}`);
      if (!res.ok) throw new Error("Không thể tải lịch sử log");
      return res.json();
    },
  });

  const logEntryMutation = useMutation({
    mutationFn: async (data: {
      trackerId: string;
      value: number;
      type?: "expense" | "income" | "default";
      category?: string;
      note?: string;
      date: string | Date;
    }) => {
      const res = await fetch("/api/tracker-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể lưu log");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracker-entries"] });
      toast.success("Đã ghi nhận dữ liệu thành công!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TrackerEntryDTO> }) => {
      const res = await fetch(`/api/tracker-entries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Không thể sửa log");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracker-entries"] });
      toast.success("Đã cập nhật log!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tracker-entries/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Không thể xoá log");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracker-entries"] });
      toast.success("Đã xoá log!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return {
    entries: entriesQuery.data || [],
    isLoading: entriesQuery.isLoading,
    isError: entriesQuery.isError,
    refetch: entriesQuery.refetch,
    logEntry: logEntryMutation.mutateAsync,
    updateEntry: updateEntryMutation.mutateAsync,
    deleteEntry: deleteEntryMutation.mutateAsync,
    isLogging: logEntryMutation.isPending,
  };
}
