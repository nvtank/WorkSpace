"use client";

import React, { useState, useEffect } from "react";
import { TrackerDTO, UnitType } from "@/types";
import { DESIGN_TOKENS } from "@/lib/constants/design-tokens";
import { X, Activity, Waves, BookOpen, Dumbbell, Wallet, Heart, Flame, Sparkles, Coffee, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrackerFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<TrackerDTO>) => Promise<any>;
  initialData?: TrackerDTO | null;
}

const AVAILABLE_ICONS = [
  { name: "Activity", icon: Activity, label: "Hoạt động" },
  { name: "Waves", icon: Waves, label: "Bơi lội" },
  { name: "Dumbbell", icon: Dumbbell, label: "Tập gym" },
  { name: "BookOpen", icon: BookOpen, label: "Đọc sách" },
  { name: "Wallet", icon: Wallet, label: "Chi tiêu" },
  { name: "Heart", icon: Heart, label: "Sức khoẻ" },
  { name: "Flame", icon: Flame, label: "Thói quen" },
  { name: "Coffee", icon: Coffee, label: "Ăn uống" },
  { name: "Moon", icon: Moon, label: "Ngủ nghỉ" },
  { name: "Sparkles", icon: Sparkles, label: "Khác" },
];

export function TrackerFormDialog({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: TrackerFormDialogProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("Activity");
  const [color, setColor] = useState("#4a154b");
  const [unitType, setUnitType] = useState<UnitType>("count");
  const [unitLabel, setUnitLabel] = useState("");
  const [hasGoal, setHasGoal] = useState(false);
  const [goalPeriod, setGoalPeriod] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [goalTargetValue, setGoalTargetValue] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setIcon(initialData.icon || "Activity");
      setColor(initialData.color || "#4a154b");
      setUnitType(initialData.unitType || "count");
      setUnitLabel(initialData.unitLabel || "");
      if (initialData.goal) {
        setHasGoal(true);
        setGoalPeriod(initialData.goal.period);
        setGoalTargetValue(initialData.goal.targetValue);
      } else {
        setHasGoal(false);
        setGoalTargetValue("");
      }
    } else {
      setName("");
      setIcon("Activity");
      setColor("#4a154b");
      setUnitType("count");
      setUnitLabel("lần");
      setHasGoal(false);
      setGoalPeriod("weekly");
      setGoalTargetValue("");
    }
  }, [initialData, isOpen]);

  // Set default unit label on type change
  const handleUnitTypeChange = (type: UnitType) => {
    setUnitType(type);
    if (!initialData) {
      if (type === "duration") setUnitLabel("phút");
      else if (type === "currency") setUnitLabel("VNĐ");
      else if (type === "count") setUnitLabel("lần");
      else setUnitLabel("đơn vị");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        icon,
        color,
        unitType,
        unitLabel: unitLabel.trim(),
        goal:
          hasGoal && typeof goalTargetValue === "number" && goalTargetValue > 0
            ? { period: goalPeriod, targetValue: goalTargetValue }
            : undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-surface rounded-xl border border-hairline shadow-elevation2 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline">
          <h2 className="text-lg font-bold text-ink">
            {initialData ? "Chỉnh sửa Tracker" : "Thêm Tracker mới"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-mute hover:text-ink transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              Tên chỉ số <span className="text-semantic-error">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Bơi lội, Chi tiêu ăn uống, Đọc sách..."
              className="input-base"
            />
          </div>

          {/* Unit Type */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              Loại đơn vị
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { type: "duration", label: "Thời lượng" },
                { type: "currency", label: "Tiền tệ" },
                { type: "count", label: "Đếm số lần" },
                { type: "custom", label: "Tuỳ chỉnh" },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => handleUnitTypeChange(item.type as UnitType)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-xs font-semibold border transition-all",
                    unitType === item.type
                      ? "border-primary bg-canvas-lavender text-primary font-bold shadow-sm"
                      : "border-hairline bg-canvas text-ink hover:bg-canvas-cream/50"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Unit Label */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              Đơn vị hiển thị
            </label>
            <input
              type="text"
              value={unitLabel}
              onChange={(e) => setUnitLabel(e.target.value)}
              placeholder="VD: phút, giờ, VNĐ, lần, trang..."
              className="input-base"
            />
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              Biểu tượng
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_ICONS.map((item) => {
                const IconComp = item.icon;
                const isSelected = icon === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setIcon(item.name)}
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center border transition-all",
                      isSelected
                        ? "border-primary bg-primary text-white"
                        : "border-hairline bg-canvas text-ink hover:bg-canvas-lavender"
                    )}
                    title={item.label}
                  >
                    <IconComp className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              Màu chủ đạo
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {DESIGN_TOKENS.categoryPalette.map((p) => (
                <button
                  key={p.hex}
                  type="button"
                  onClick={() => setColor(p.hex)}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-transform",
                    color === p.hex ? "scale-110 border-ink shadow-sm" : "border-transparent"
                  )}
                  style={{ backgroundColor: p.hex }}
                  title={p.label}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded-full border border-hairline cursor-pointer"
                title="Màu tuỳ chỉnh"
              />
            </div>
          </div>

          {/* Goal Settings */}
          <div className="pt-2 border-t border-hairline">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-ink">
                Đặt mục tiêu định kỳ (tuỳ chọn)
              </label>
              <input
                type="checkbox"
                checked={hasGoal}
                onChange={(e) => setHasGoal(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary"
              />
            </div>

            {hasGoal && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-ink-mute mb-1">
                    Chu kỳ
                  </label>
                  <select
                    value={goalPeriod}
                    onChange={(e) => setGoalPeriod(e.target.value as any)}
                    className="input-base text-sm"
                  >
                    <option value="daily">Hàng ngày</option>
                    <option value="weekly">Hàng tuần</option>
                    <option value="monthly">Hàng tháng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-mute mb-1">
                    Giá trị mục tiêu ({unitLabel || "đơn vị"})
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={goalTargetValue}
                    onChange={(e) =>
                      setGoalTargetValue(e.target.value ? parseFloat(e.target.value) : "")
                    }
                    placeholder="VD: 180"
                    className="input-base text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-hairline">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline-compact"
              disabled={isSubmitting}
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="btn-primary-compact"
            >
              {isSubmitting ? "Đang lưu..." : initialData ? "Lưu thay đổi" : "Tạo Tracker"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
