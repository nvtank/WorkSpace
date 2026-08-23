"use client";

import React, { useState } from "react";
import { formatZonedDate } from "@/lib/utils";
import { format, addDays, addWeeks, startOfWeek, isSameDay, parseISO } from "date-fns";
import { X, Copy, Calendar, Sparkles, Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyDayDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sourceDate: string;
  onCopy: (payload: {
    sourceDate: string;
    targetDates: string[];
    conflictMode: "skip" | "overwrite" | "keep_both";
  }) => Promise<any>;
}

export function CopyDayDialog({
  isOpen,
  onClose,
  sourceDate,
  onCopy,
}: CopyDayDialogProps) {
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [conflictMode, setConflictMode] = useState<"skip" | "overwrite" | "keep_both">("keep_both");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const srcDateObj = parseISO(sourceDate);

  // Quick patterns
  const handleApplyPattern = (pattern: "next_4_same_weekday" | "this_entire_week" | "next_week_workdays") => {
    const dates: string[] = [];

    if (pattern === "next_4_same_weekday") {
      // All occurrences of the same weekday for next 4 weeks
      for (let i = 1; i <= 4; i++) {
        const nextDate = addWeeks(srcDateObj, i);
        dates.push(format(nextDate, "yyyy-MM-dd"));
      }
    } else if (pattern === "this_entire_week") {
      // Entire current week excluding sourceDate
      const weekStart = startOfWeek(srcDateObj, { weekStartsOn: 1 });
      for (let i = 0; i < 7; i++) {
        const d = addDays(weekStart, i);
        if (!isSameDay(d, srcDateObj)) {
          dates.push(format(d, "yyyy-MM-dd"));
        }
      }
    } else if (pattern === "next_week_workdays") {
      // Next week Monday to Friday
      const nextWeekStart = startOfWeek(addWeeks(srcDateObj, 1), { weekStartsOn: 1 });
      for (let i = 0; i < 5; i++) {
        const d = addDays(nextWeekStart, i);
        dates.push(format(d, "yyyy-MM-dd"));
      }
    }

    setSelectedDates(Array.from(new Set([...selectedDates, ...dates])));
  };

  const handleToggleDate = (dateStr: string) => {
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter((d) => d !== dateStr));
    } else {
      setSelectedDates([...selectedDates, dateStr]);
    }
  };

  // Generate a 14-day calendar picker starting from today
  const next14Days = Array.from({ length: 14 }).map((_, i) => {
    const d = addDays(new Date(), i);
    return {
      dateStr: format(d, "yyyy-MM-dd"),
      dayOfWeek: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][d.getDay()],
      dayNum: d.getDate(),
      month: d.getMonth() + 1,
      isSource: isSameDay(d, srcDateObj),
    };
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDates.length === 0) return;

    setIsSubmitting(true);
    try {
      await onCopy({
        sourceDate,
        targetDates: selectedDates,
        conflictMode,
      });
      setSelectedDates([]);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-surface rounded-xl border border-hairline shadow-elevation2 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline bg-canvas-cream/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
              <Copy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">Sao chép lịch ngày (Copy Day)</h2>
              <p className="text-xs text-ink-mute">
                Nguồn: {formatZonedDate(sourceDate, "EEEE, dd/MM/yyyy")}
              </p>
            </div>
          </div>
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
          {/* Quick Patterns */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-mute mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Mẫu sao chép nhanh</span>
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleApplyPattern("next_4_same_weekday")}
                className="text-xs font-semibold px-3 py-1.5 rounded-pill bg-canvas-lavender hover:bg-canvas-lavender/80 text-primary border border-hairline transition-colors"
              >
                + 4 tuần tới (cùng thứ)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPattern("this_entire_week")}
                className="text-xs font-semibold px-3 py-1.5 rounded-pill bg-canvas-lavender hover:bg-canvas-lavender/80 text-primary border border-hairline transition-colors"
              >
                + Toàn bộ tuần này
              </button>
              <button
                type="button"
                onClick={() => handleApplyPattern("next_week_workdays")}
                className="text-xs font-semibold px-3 py-1.5 rounded-pill bg-canvas-lavender hover:bg-canvas-lavender/80 text-primary border border-hairline transition-colors"
              >
                + T2-T6 tuần sau
              </button>
            </div>
          </div>

          {/* Mini Calendar Multi-Select */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-mute mb-2 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Hoặc chọn ngày đích ({selectedDates.length} ngày đã chọn)</span>
            </label>

            <div className="grid grid-cols-7 gap-1.5 p-2 bg-canvas rounded-lg border border-hairline">
              {next14Days.map((d) => {
                const isSelected = selectedDates.includes(d.dateStr);
                return (
                  <button
                    key={d.dateStr}
                    type="button"
                    disabled={d.isSource}
                    onClick={() => handleToggleDate(d.dateStr)}
                    className={cn(
                      "flex flex-col items-center py-2 px-1 rounded-md text-xs font-bold transition-all",
                      d.isSource
                        ? "bg-canvas-cream text-ink-mute opacity-50 cursor-not-allowed"
                        : isSelected
                        ? "bg-primary text-white shadow-sm"
                        : "bg-canvas-lavender/40 hover:bg-canvas-lavender text-ink"
                    )}
                  >
                    <span className="text-[10px] uppercase">{d.dayOfWeek}</span>
                    <span className="text-sm mt-0.5">{d.dayNum}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conflict Resolution Mode */}
          <div className="pt-2 border-t border-hairline">
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-mute mb-2 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-sand" />
              <span>Xử lý khi ngày đích đã có task trùng giờ</span>
            </label>

            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-hairline hover:bg-canvas-cream/40 cursor-pointer">
                <input
                  type="radio"
                  name="conflict"
                  checked={conflictMode === "keep_both"}
                  onChange={() => setConflictMode("keep_both")}
                  className="text-primary focus:ring-primary accent-primary"
                />
                <div>
                  <p className="font-bold text-ink">Vẫn thêm (Chồng lịch)</p>
                  <p className="text-ink-mute text-[11px]">
                    Giữ lại cả task cũ và tạo thêm task mới
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-hairline hover:bg-canvas-cream/40 cursor-pointer">
                <input
                  type="radio"
                  name="conflict"
                  checked={conflictMode === "skip"}
                  onChange={() => setConflictMode("skip")}
                  className="text-primary focus:ring-primary accent-primary"
                />
                <div>
                  <p className="font-bold text-ink">Bỏ qua task trùng giờ</p>
                  <p className="text-ink-mute text-[11px]">
                    Chỉ thêm các task mà khung giờ ngày đích còn trống
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-hairline hover:bg-canvas-cream/40 cursor-pointer">
                <input
                  type="radio"
                  name="conflict"
                  checked={conflictMode === "overwrite"}
                  onChange={() => setConflictMode("overwrite")}
                  className="text-primary focus:ring-primary accent-primary"
                />
                <div>
                  <p className="font-bold text-semantic-error">Ghi đè ngày đích</p>
                  <p className="text-ink-mute text-[11px]">
                    Xoá toàn bộ task hiện có ở ngày đích trước khi sao chép
                  </p>
                </div>
              </label>
            </div>
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
              disabled={isSubmitting || selectedDates.length === 0}
              className="btn-primary-compact inline-flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? "Đang sao chép..."
                  : `Sao chép sang ${selectedDates.length} ngày`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
