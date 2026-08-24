"use client";

import React, { useState } from "react";
import { useJournals } from "@/hooks/use-journals";
import { JournalList } from "@/components/journal/journal-list";
import { JournalEditor } from "@/components/journal/journal-editor";
import { JournalDTO } from "@/types";
import { Plus } from "lucide-react";

export default function JournalPage() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const {
    journals,
    isLoading,
    createJournal,
    updateJournal,
    deleteJournal,
  } = useJournals({ month: currentMonth });

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingJournal, setEditingJournal] = useState<JournalDTO | null>(null);

  const handleOpenCreate = () => {
    setEditingJournal(null);
    setEditorOpen(true);
  };

  const handleEditJournal = (journal: JournalDTO) => {
    setEditingJournal(journal);
    setEditorOpen(true);
  };

  const handleFormSubmit = async (data: Partial<JournalDTO>) => {
    if (editingJournal) {
      await updateJournal({ id: editingJournal.id, data });
    } else {
      await createJournal(data);
    }
    setEditorOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Nhật ký</h1>
          <p className="text-sm text-ink-mute mt-1">Ghi lại cảm xúc và suy nghĩ của bạn</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-press transition-colors"
        >
          <Plus className="w-4 h-4" />
          Viết nhật ký
        </button>
      </div>

      {/* Month filter */}
      <div className="flex items-center gap-2">
        <label htmlFor="month-filter" className="text-sm font-medium text-ink">
          Tháng:
        </label>
        <input
          id="month-filter"
          type="month"
          value={currentMonth}
          onChange={(e) => setCurrentMonth(e.target.value)}
          className="px-3 py-1.5 border border-hairline rounded-md text-ink bg-canvas text-sm"
        />
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-12 text-ink-mute">
          <p>Đang tải...</p>
        </div>
      )}

      {/* Journal list */}
      {!isLoading && (
        <JournalList
          journals={journals}
          onEdit={handleEditJournal}
          onDelete={deleteJournal}
        />
      )}

      {/* Editor modal */}
      <JournalEditor
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingJournal}
      />
    </div>
  );
}
