"use client";

import React, { useState, useEffect } from "react";
import { JournalDTO } from "@/types";
import { DESIGN_TOKENS } from "@/lib/constants/design-tokens";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface JournalEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<JournalDTO>) => Promise<void>;
  initialData?: JournalDTO | null;
}

export function JournalEditor({ isOpen, onClose, onSubmit, initialData }: JournalEditorProps) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [content, setContent] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setDate(initialData.date.split("T")[0]);
      setMood(initialData.mood);
      setContent(initialData.content);
      setSelectedPrompt(initialData.prompt || "");
    } else {
      // Random prompt khi tạo mới
      const randomPrompt = DESIGN_TOKENS.journalPrompts[
        Math.floor(Math.random() * DESIGN_TOKENS.journalPrompts.length)
      ];
      setSelectedPrompt(randomPrompt);
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        date,
        mood,
        content,
        prompt: selectedPrompt,
      });
      onClose();
      // Reset form
      setDate(new Date().toISOString().split("T")[0]);
      setMood(3);
      setContent("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-ink/50 z-50 flex items-center justify-center p-4">
      <div className="bg-canvas rounded-lg shadow-elevation3 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-hairline">
          <h2 className="text-lg font-bold text-ink">
            {initialData ? "Chỉnh sửa nhật ký" : "Viết nhật ký mới"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-mute hover:text-ink transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Date picker */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Ngày</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-hairline rounded-md text-ink bg-canvas"
              required
            />
          </div>

          {/* Mood selector */}
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Tâm trạng hôm nay</label>
            <div className="flex gap-2 justify-between">
              {DESIGN_TOKENS.moods.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(m.value as 1 | 2 | 3 | 4 | 5)}
                  className={cn(
                    "flex-1 p-3 rounded-lg border-2 transition-all text-center",
                    mood === m.value
                      ? "border-primary bg-canvas-lavender shadow-sm"
                      : "border-hairline bg-canvas hover:border-primary/30"
                  )}
                  title={m.label}
                >
                  <div className="text-2xl mb-1">{m.emoji}</div>
                  <div className="text-xs text-ink-mute">{m.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt selector */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Gợi ý (tùy chọn)</label>
            <select
              value={selectedPrompt}
              onChange={(e) => setSelectedPrompt(e.target.value)}
              className="w-full px-3 py-2 border border-hairline rounded-md text-ink bg-canvas"
            >
              <option value="">-- Không chọn --</option>
              {DESIGN_TOKENS.journalPrompts.map((prompt) => (
                <option key={prompt} value={prompt}>
                  {prompt}
                </option>
              ))}
            </select>
          </div>

          {/* Content textarea */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Nội dung</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Viết về ngày của bạn..."
              rows={10}
              className="w-full px-3 py-2 border border-hairline rounded-md text-ink bg-canvas resize-none"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-ink-mute hover:text-ink transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-press transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
