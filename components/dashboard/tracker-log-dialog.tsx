"use client";

import React, { useState } from "react";
import { TrackerDTO } from "@/types";
import { X, Calendar } from "lucide-react";
import { format } from "date-fns";

interface TrackerLogDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tracker: TrackerDTO | null;
  onSubmit: (data: {
    trackerId: string;
    value: number;
    category?: string;
    note?: string;
    date: string;
  }) => Promise<any>;
}

const DEFAULT_CURRENCY_CATEGORIES = [
  "Ăn uống",
  "Di chuyển",
  "Giải trí",
  "Mua sắm",
  "Hoá đơn & Nhà cửa",
  "Học tập",
  "Khác",
];

export function TrackerLogDialog({
  isOpen,
  onClose,
  tracker,
  onSubmit,
}: TrackerLogDialogProps) {
  const [value, setValue] = useState<number | "">("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [category, setCategory] = useState("Ăn uống");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !tracker) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (value === "" || value < 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        trackerId: tracker.id,
        value: Number(value),
        category: tracker.unitType === "currency" ? category : undefined,
        note: note.trim() || undefined,
        date,
      });
      setValue("");
      setNote("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-surface rounded-xl border border-hairline shadow-elevation2 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline bg-canvas-cream/30">
          <div>
            <span className="badge-pill mb-1">Log nhanh</span>
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: tracker.color }}
              />
              {tracker.name}
            </h2>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              Giá trị ({tracker.unitLabel || "đơn vị"}) <span className="text-semantic-error">*</span>
            </label>
            <input
              type="number"
              step="any"
              min="0"
              required
              autoFocus
              value={value}
              onChange={(e) =>
                setValue(e.target.value ? parseFloat(e.target.value) : "")
              }
              placeholder={tracker.unitType === "currency" ? "VD: 50000" : "VD: 30"}
              className="input-base text-lg font-bold text-primary"
            />
          </div>

          {/* Currency Category Picker */}
          {tracker.unitType === "currency" && (
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">
                Hạng mục chi tiêu
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-base"
              >
                {DEFAULT_CURRENCY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Picker (supports backfill) */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-ink-mute" />
              <span>Ngày ghi nhận</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-base"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              Ghi chú ngắn (tuỳ chọn)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Cơm trưa với bạn, 10 vòng bể..."
              className="input-base"
            />
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
              disabled={isSubmitting || value === ""}
              className="btn-primary-compact"
            >
              {isSubmitting ? "Đang lưu..." : "Lưu dữ liệu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
