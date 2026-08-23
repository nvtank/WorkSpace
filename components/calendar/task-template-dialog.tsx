"use client";

import React, { useState } from "react";
import { TaskDTO, TaskTemplateDTO } from "@/types";
import { X, BookmarkPlus, Check, Trash2, Calendar, Sparkles } from "lucide-react";
import { formatZonedDate } from "@/lib/utils";

interface TaskTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentDayTasks: TaskDTO[];
  targetDate: string;
  templates: TaskTemplateDTO[];
  onCreateTemplate: (data: Partial<TaskTemplateDTO>) => Promise<any>;
  onApplyTemplate: (params: { templateId: string; targetDate: string }) => Promise<any>;
  onDeleteTemplate: (id: string) => Promise<any>;
}

export function TaskTemplateDialog({
  isOpen,
  onClose,
  currentDayTasks,
  targetDate,
  templates,
  onCreateTemplate,
  onApplyTemplate,
  onDeleteTemplate,
}: TaskTemplateDialogProps) {
  const [templateName, setTemplateName] = useState("");
  const [activeTab, setActiveTab] = useState<"apply" | "create">("apply");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim() || currentDayTasks.length === 0) return;

    setIsSubmitting(true);
    try {
      await onCreateTemplate({
        name: templateName.trim(),
        tasks: currentDayTasks.map((t) => ({
          title: t.title,
          description: t.description,
          startTime: t.startTime || undefined,
          endTime: t.endTime || undefined,
          categoryId: t.categoryId || undefined,
          priority: t.priority,
          status: "todo",
          color: t.color,
          reminder: t.reminder,
          subtasks: t.subtasks,
          order: t.order,
        })),
      });
      setTemplateName("");
      setActiveTab("apply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApply = async (templateId: string) => {
    setIsSubmitting(true);
    try {
      await onApplyTemplate({ templateId, targetDate });
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
          <div>
            <h2 className="text-base font-bold text-ink">Mẫu ngày chuẩn (Task Templates)</h2>
            <p className="text-xs text-ink-mute">
              Áp dụng cho ngày: {formatZonedDate(targetDate, "dd/MM/yyyy")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-mute hover:text-ink transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-hairline px-6 pt-3 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab("apply")}
            className={`pb-2.5 text-xs font-bold transition-colors border-b-2 ${
              activeTab === "apply"
                ? "border-primary text-primary"
                : "border-transparent text-ink-mute hover:text-ink"
            }`}
          >
            Danh sách Templates ({templates.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("create")}
            className={`pb-2.5 text-xs font-bold transition-colors border-b-2 ${
              activeTab === "create"
                ? "border-primary text-primary"
                : "border-transparent text-ink-mute hover:text-ink"
            }`}
          >
            Lưu ngày hiện tại thành Template
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {activeTab === "apply" ? (
            <div className="space-y-3">
              {templates.length === 0 ? (
                <div className="text-center py-8 text-xs text-ink-mute">
                  <Sparkles className="w-6 h-6 text-primary/40 mx-auto mb-2" />
                  <p>Chưa có template nào.</p>
                  <p className="mt-1">
                    Hãy lưu lịch của một ngày làm việc chuẩn để áp dụng lại nhanh chóng!
                  </p>
                </div>
              ) : (
                templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="p-3 rounded-lg border border-hairline bg-canvas flex items-center justify-between gap-3 hover:border-primary/50 transition-colors"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-ink">{tpl.name}</h4>
                      <p className="text-xs text-ink-mute mt-0.5">
                        {tpl.tasks.length} công việc • Tạo ngày{" "}
                        {formatZonedDate(tpl.createdAt, "dd/MM/yyyy")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleApply(tpl.id)}
                        disabled={isSubmitting}
                        className="btn-primary-compact text-xs"
                      >
                        Áp dụng
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Xoá template "${tpl.name}"?`)) {
                            onDeleteTemplate(tpl.id);
                          }
                        }}
                        className="btn-icon-compact text-ink-mute hover:text-semantic-error"
                        title="Xoá"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">
                  Tên Template mới
                </label>
                <input
                  type="text"
                  required
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="VD: Ngày làm việc tiêu chuẩn, Ngày ôn thi cuối tuần..."
                  className="input-base"
                />
              </div>

              <div className="p-3 rounded-lg bg-canvas-cream/50 border border-hairline text-xs">
                <p className="font-bold text-ink mb-1">
                  Sẽ lưu {currentDayTasks.length} task của ngày hiện tại:
                </p>
                <ul className="list-disc list-inside text-ink-mute space-y-0.5 max-h-32 overflow-y-auto">
                  {currentDayTasks.map((t) => (
                    <li key={t.id} className="truncate">
                      {t.startTime ? `[${t.startTime}] ` : ""}{t.title}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !templateName.trim() || currentDayTasks.length === 0}
                className="btn-primary-compact w-full"
              >
                {isSubmitting ? "Đang lưu..." : "Lưu làm Template"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
