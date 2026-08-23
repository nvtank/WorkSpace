"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserDTO } from "@/types";
import { toast } from "sonner";

export function useUser() {
  const queryClient = useQueryClient();

  const userQuery = useQuery<UserDTO>({
    queryKey: ["user-settings"],
    queryFn: async () => {
      const res = await fetch("/api/user/settings");
      if (!res.ok) throw new Error("Không thể tải thông tin người dùng");
      return res.json();
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<UserDTO>) => {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể lưu cài đặt");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-settings"] });
      toast.success("Đã lưu cài đặt thành công!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    updateSettings: updateSettingsMutation.mutateAsync,
    isUpdating: updateSettingsMutation.isPending,
  };
}
