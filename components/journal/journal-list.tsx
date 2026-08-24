"use client";

import React from "react";
import { JournalDTO } from "@/types";
import { DESIGN_TOKENS } from "@/lib/constants/design-tokens";
import { Edit, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface JournalListProps {
  journals: JournalDTO[];
  onEdit: (journal: JournalDTO) => void;
  onDelete: (id: string) => void;
}

export function JournalList({ journals, onEdit, onDelete }: JournalListProps) {
  if (journals.length === 0) {
    return (
      <div className="text-center py-12 text-ink-mute">
        <p>Chưa có nhật ký nào. Hãy viết nhật ký đầu tiên của bạn!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {journals.map((journal) => {
        const moodData = DESIGN_TOKENS.moods.find((m) => m.value === journal.mood);
        const journalDate = new Date(journal.date);

        return (
          <div
            key={journal.id}
            className="bg-surface border border-hairline rounded-lg p-4 hover:shadow-elevation1 transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {/* Mood emoji */}
                {moodData && (
                  <div
                    className="text-3xl p-2 rounded-lg"
                    style={{ backgroundColor: `${moodData.color}15` }}
                  >
                    {moodData.emoji}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 text-ink-mute text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {format(journalDate, "EEEE, d MMMM yyyy", { locale: vi })}
                    </span>
                  </div>
                  {moodData && (
                    <div className="text-xs text-ink-mute mt-0.5">
                      Tâm trạng: {moodData.label}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1">
                <button
                  onClick={() => onEdit(journal)}
                  className="p-2 text-ink-mute hover:text-primary hover:bg-canvas-lavender rounded-md transition-colors"
                  title="Chỉnh sửa"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm("Bạn có chắc muốn xóa nhật ký này?")) {
                      onDelete(journal.id);
                    }
                  }}
                  className="p-2 text-ink-mute hover:text-semantic-error hover:bg-semantic-error/10 rounded-md transition-colors"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Prompt (if exists) */}
            {journal.prompt && (
              <div className="bg-canvas-lavender/50 rounded-md p-2 mb-3 text-sm text-ink-mute italic">
                💭 {journal.prompt}
              </div>
            )}

            {/* Content */}
            <div className="text-ink whitespace-pre-wrap leading-relaxed">
              {journal.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
