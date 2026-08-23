import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống").max(200, "Tiêu đề tối đa 200 ký tự"),
  description: z.string().max(2000, "Mô tả tối đa 2000 ký tự").optional(),
  date: z.string().or(z.date()),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Giờ bắt đầu không hợp lệ (HH:mm)")
    .nullable()
    .optional(),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Giờ kết thúc không hợp lệ (HH:mm)")
    .nullable()
    .optional(),
  categoryId: z.string().nullable().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
  color: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurrenceRule: z
    .object({
      freq: z.enum(["daily", "weekly", "custom"]),
      daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
      until: z.string().or(z.date()).optional(),
    })
    .optional(),
  reminder: z
    .object({
      enabled: z.boolean(),
      minutesBefore: z.number().min(1),
    })
    .optional(),
  subtasks: z
    .array(
      z.object({
        title: z.string().min(1, "Nội dung việc con không được để trống"),
        done: z.boolean().default(false),
      })
    )
    .optional(),
  order: z.number().optional(),
});

export const copyDaySchema = z.object({
  sourceDate: z.string().min(1, "Ngày nguồn là bắt buộc"),
  targetDates: z.array(z.string()).min(1, "Cần chọn ít nhất 1 ngày đích"),
  conflictMode: z.enum(["skip", "overwrite", "keep_both"]).default("keep_both"),
});

export const taskTemplateSchema = z.object({
  name: z.string().min(1, "Tên template không được để trống").max(100),
  tasks: z.array(
    z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      categoryId: z.string().optional(),
      priority: z.enum(["low", "medium", "high"]).default("medium"),
      status: z.enum(["todo", "in_progress", "done"]).default("todo"),
      color: z.string().optional(),
      reminder: z
        .object({
          enabled: z.boolean(),
          minutesBefore: z.number(),
        })
        .optional(),
      subtasks: z
        .array(
          z.object({
            title: z.string(),
            done: z.boolean(),
          })
        )
        .optional(),
      order: z.number().default(0),
    })
  ),
});
