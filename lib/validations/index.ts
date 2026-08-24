import { z } from "zod";

export const noteSchema = z.object({
  content: z.string().min(1, "Nội dung ghi chú không được để trống"),
  images: z.array(z.string().url()).default([]),
  tags: z.array(z.string()).default([]),
  isPinned: z.boolean().default(false),
});

export const courseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Tên môn học không được để trống"),
  credits: z.number().min(0, "Số tín chỉ phải lớn hơn hoặc bằng 0"),
  grade: z.number().min(0).max(10, "Điểm không vượt quá 10.0").nullable().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  status: z.enum(["completed", "planned"]).default("planned"),
});

export const semesterSchema = z.object({
  name: z.string().min(1, "Tên học kỳ không được để trống"),
  order: z.number().default(0),
  courses: z.array(courseSchema).default([]),
});

export const academicGoalSchema = z.object({
  targetGPA: z.number().min(0).max(4.0, "GPA mục tiêu tối đa 4.0"),
  totalCreditsRequired: z.number().min(1, "Tổng tín chỉ phải lớn hơn 0"),
});

export const journalSchema = z.object({
  date: z.string().or(z.date()),
  mood: z.number().min(1).max(5).int(),
  content: z.string().min(1, "Nội dung nhật ký không được để trống"),
  prompt: z.string().optional(),
});

export const userSettingsSchema = z.object({
  name: z.string().min(1, "Tên không được để trống"),
  avatarUrl: z.string().optional(),
  timezone: z.string().default("Asia/Ho_Chi_Minh"),
  preferences: z.object({
    theme: z.enum(["light", "dark", "system"]).default("light"),
    weekStartsOn: z.union([z.literal(0), z.literal(1)]).default(1),
  }),
  gradeScale: z.object({
    max: z.number().default(4.0),
    conversionTable: z.array(
      z.object({
        label: z.string(),
        min: z.number(),
        max: z.number(),
        value: z.number(),
      })
    ),
  }),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp với mật khẩu mới",
    path: ["confirmPassword"],
  });
