import { z } from "zod";

export const trackerSchema = z.object({
  name: z.string().min(1, "Tên chỉ số không được để trống").max(50, "Tên tối đa 50 ký tự"),
  icon: z.string().default("Activity"),
  color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Màu sắc không hợp lệ").default("#4a154b"),
  unitType: z.enum(["duration", "currency", "count", "custom"]),
  unitLabel: z.string().max(20, "Đơn vị tối đa 20 ký tự").optional(),
  goal: z
    .object({
      period: z.enum(["daily", "weekly", "monthly"]),
      targetValue: z.number().positive("Mục tiêu phải lớn hơn 0"),
    })
    .optional(),
  order: z.number().optional(),
});

export const trackerEntrySchema = z.object({
  trackerId: z.string().min(1, "Tracker ID không hợp lệ"),
  value: z.number().min(0, "Giá trị không được âm"),
  type: z.enum(["expense", "income", "default"]).optional(),
  category: z.string().max(50).optional(),
  note: z.string().max(500, "Ghi chú tối đa 500 ký tự").optional(),
  date: z.string().or(z.date()),
});
