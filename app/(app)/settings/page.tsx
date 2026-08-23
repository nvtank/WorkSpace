"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import { GradeScaleItem } from "@/types";
import {
  Settings,
  User,
  GraduationCap,
  Sliders,
  Plus,
  Trash2,
  Save,
  Check,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, updateSettings, isUpdating } = useUser();

  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("Asia/Ho_Chi_Minh");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [weekStartsOn, setWeekStartsOn] = useState<0 | 1>(1);

  // Grade scale table
  const [maxGrade, setMaxGrade] = useState(4.0);
  const [conversionTable, setConversionTable] = useState<GradeScaleItem[]>([]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setTimezone(user.timezone || "Asia/Ho_Chi_Minh");
      setTheme(user.preferences?.theme || "light");
      setWeekStartsOn(user.preferences?.weekStartsOn ?? 1);
      if (user.gradeScale) {
        setMaxGrade(user.gradeScale.max || 4.0);
        setConversionTable(user.gradeScale.conversionTable || []);
      }
    }
  }, [user]);

  const handleAddScaleRow = () => {
    setConversionTable([
      ...conversionTable,
      { label: "Mới", min: 0, max: 10, value: 4.0 },
    ]);
  };

  const handleUpdateScaleRow = (
    index: number,
    field: keyof GradeScaleItem,
    val: any
  ) => {
    setConversionTable((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: val } : item))
    );
  };

  const handleRemoveScaleRow = (index: number) => {
    setConversionTable((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await updateSettings({
      name: name.trim(),
      timezone,
      preferences: {
        theme,
        weekStartsOn,
      },
      gradeScale: {
        max: maxGrade,
        conversionTable,
      },
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 bg-surface p-6 rounded-xl border border-hairline shadow-sm">
        <div className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center shadow-sm">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-ink">Cài Đặt Hệ Thống</h2>
          <p className="text-xs text-ink-mute">
            Quản lý hồ sơ cá nhân, tuỳ biến bảng quy đổi thang điểm và giao diện
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile & Preferences */}
        <div className="card-base bg-surface p-6 border border-hairline shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-hairline">
            <User className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-base text-ink">Hồ Sơ & Tuỳ Chọn</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">
                Tên hiển thị
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">
                Múi giờ hệ thống
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="input-base"
              >
                <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</option>
                <option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                <option value="UTC">UTC (GMT+0)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">
                Giao diện (Theme)
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
                className="input-base"
              >
                <option value="light">Sáng (Light - Aubergine)</option>
                <option value="dark">Tối (Dark Mode)</option>
                <option value="system">Theo hệ thống (System)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">
                Ngày bắt đầu tuần
              </label>
              <select
                value={weekStartsOn}
                onChange={(e) => setWeekStartsOn(parseInt(e.target.value, 10) as 0 | 1)}
                className="input-base"
              >
                <option value={1}>Thứ 2 (Monday)</option>
                <option value={0}>Chủ Nhật (Sunday)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grade Scale Conversion Table (PROMPT.md §4.5) */}
        <div className="card-base bg-surface p-6 border border-hairline shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-hairline">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-primary" />
              <div>
                <h3 className="font-bold text-base text-ink">Bảng Quy Đổi Điểm (Grade Scale)</h3>
                <p className="text-xs text-ink-mute">
                  Tuỳ chỉnh theo quy chế riêng của trường đại học bạn đang theo học
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddScaleRow}
              className="btn-secondary-compact text-xs inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm mốc
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-hairline text-ink-mute font-bold">
                  <th className="pb-2">Thang chữ</th>
                  <th className="pb-2 text-center">Điểm thang 10 (Từ)</th>
                  <th className="pb-2 text-center">Điểm thang 10 (Đến)</th>
                  <th className="pb-2 text-center">Điểm quy đổi hệ 4</th>
                  <th className="pb-2 text-right">Xoá</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline/60">
                {conversionTable.map((row, idx) => (
                  <tr key={idx}>
                    <td className="py-2">
                      <input
                        type="text"
                        value={row.label}
                        onChange={(e) =>
                          handleUpdateScaleRow(idx, "label", e.target.value)
                        }
                        className="w-16 input-base py-1 px-2 text-xs font-bold"
                      />
                    </td>
                    <td className="py-2 text-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={row.min}
                        onChange={(e) =>
                          handleUpdateScaleRow(idx, "min", parseFloat(e.target.value) || 0)
                        }
                        className="w-20 input-base py-1 px-2 text-xs text-center"
                      />
                    </td>
                    <td className="py-2 text-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={row.max}
                        onChange={(e) =>
                          handleUpdateScaleRow(idx, "max", parseFloat(e.target.value) || 0)
                        }
                        className="w-20 input-base py-1 px-2 text-xs text-center"
                      />
                    </td>
                    <td className="py-2 text-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="4.0"
                        value={row.value}
                        onChange={(e) =>
                          handleUpdateScaleRow(idx, "value", parseFloat(e.target.value) || 0)
                        }
                        className="w-20 input-base py-1 px-2 text-xs text-center font-bold text-primary"
                      />
                    </td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveScaleRow(idx)}
                        className="text-ink-mute hover:text-semantic-error p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isUpdating}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isUpdating ? "Đang lưu..." : "Lưu toàn bộ cài đặt"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
