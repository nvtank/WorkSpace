"use client";

import React, { useState, useEffect } from "react";
import { TaskDTO, TaskPriority, TaskStatus, SubtaskDTO } from "@/types";
import { DESIGN_TOKENS } from "@/lib/constants/design-tokens";
import { formatZonedDate } from "@/lib/utils";
import {
  X,
  Plus,
  Trash2,
  Clock,
  Calendar as CalendarIcon,
  CheckSquare,
  Repeat,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<TaskDTO>) => Promise<any>;
  onDelete?: (id: string) => Promise<any>;
  initialData?: TaskDTO | null;
  defaultDate?: string;
  defaultStartTime?: string;
  defaultEndTime?: string;
}

export function TaskFormDialog({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  initialData,
  defaultDate,
  defaultStartTime,
  defaultEndTime,
}: TaskFormDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(
    defaultDate || formatZonedDate(new Date(), "yyyy-MM-dd")
  );
  const [hasSpecificTime, setHasSpecificTime] = useState(true);
  const [startTime, setStartTime] = useState(defaultStartTime || "09:00");
  const [endTime, setEndTime] = useState(defaultEndTime || "10:00");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [color, setColor] = useState("#4a154b");
  const [subtasks, setSubtasks] = useState<SubtaskDTO[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFreq, setRecurrenceFreq] = useState<"daily" | "weekly" | "custom">("daily");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || "");
      setDate(formatZonedDate(initialData.date, "yyyy-MM-dd"));
      if (initialData.startTime) {
        setHasSpecificTime(true);
        setStartTime(initialData.startTime);
        setEndTime(initialData.endTime || "");
      } else {
        setHasSpecificTime(false);
      }
      setPriority(initialData.priority || "medium");
      setStatus(initialData.status || "todo");
      setColor(initialData.color || "#4a154b");
      setSubtasks(initialData.subtasks || []);
      setIsRecurring(initialData.isRecurring || false);
      if (initialData.recurrenceRule) {
        setRecurrenceFreq(initialData.recurrenceRule.freq || "daily");
      }
    } else {
      setTitle("");
      setDescription("");
      setDate(defaultDate || formatZonedDate(new Date(), "yyyy-MM-dd"));
      setHasSpecificTime(!!defaultStartTime);
      setStartTime(defaultStartTime || "09:00");
      setEndTime("10:00");
      setPriority("medium");
      setStatus("todo");
      setColor("#4a154b");
      setSubtasks([]);
      setIsRecurring(false);
      setRecurrenceFreq("daily");
    }
  }, [initialData, defaultDate, defaultStartTime, isOpen]);

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([...subtasks, { title: newSubtaskTitle.trim(), done: false }]);
    setNewSubtaskTitle("");
  };

  const handleRemoveSubtask = (idx: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== idx));
  };

  const handleToggleSubtask = (idx: number) => {
    setSubtasks(
      subtasks.map((st, i) => (i === idx ? { ...st, done: !st.done } : st))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        date,
        startTime: hasSpecificTime && startTime ? startTime : null,
        endTime: hasSpecificTime && endTime ? endTime : null,
        priority,
        status,
        color,
        subtasks,
        isRecurring,
        recurrenceRule: isRecurring ? { freq: recurrenceFreq } : undefined,
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
            {initialData ? "Chỉnh sửa công việc" : "Thêm công việc mới"}
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
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              Tiêu đề công việc <span className="text-semantic-error">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Họp nhóm dự án, Ôn thi môn Giải tích..."
              className="input-base"
            />
          </div>

          {/* Date & Time Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5 flex items-center gap-1">
                <CalendarIcon className="w-4 h-4 text-ink-mute" />
                <span>Ngày thực hiện</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-base"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-ink flex items-center gap-1">
                  <Clock className="w-4 h-4 text-ink-mute" />
                  <span>Khung giờ</span>
                </label>
                <button
                  type="button"
                  onClick={() => setHasSpecificTime(!hasSpecificTime)}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  {hasSpecificTime ? "Đưa vào Backlog" : "Gán giờ cụ thể"}
                </button>
              </div>

              {hasSpecificTime ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="input-base text-sm py-2"
                  />
                  <span className="text-ink-mute">-</span>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="input-base text-sm py-2"
                  />
                </div>
              ) : (
                <div className="p-2.5 bg-canvas-cream/50 rounded-lg text-xs text-ink-mute border border-hairline">
                  Task chưa gán giờ (sẽ nằm ở Backlog)
                </div>
              )}
            </div>
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">
                Độ ưu tiên
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="input-base"
              >
                <option value="low">Thấp (Low)</option>
                <option value="medium">Vừa (Medium)</option>
                <option value="high">Cao (High 🔥)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">
                Trạng thái
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="input-base"
              >
                <option value="todo">Cần làm (To do)</option>
                <option value="in_progress">Đang làm (In Progress)</option>
                <option value="done">Hoàn thành (Done)</option>
              </select>
            </div>
          </div>

          {/* Color Tag */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              Màu phân loại
            </label>
            <div className="flex flex-wrap items-center gap-2.5">
              {DESIGN_TOKENS.categoryPalette.map((p) => (
                <button
                  key={p.hex}
                  type="button"
                  onClick={() => setColor(p.hex)}
                  className={cn(
                    "w-7 h-7 rounded-full border-2 transition-transform",
                    color === p.hex ? "scale-110 border-ink shadow-sm" : "border-transparent"
                  )}
                  style={{ backgroundColor: p.hex }}
                  title={p.label}
                />
              ))}
            </div>
          </div>

          {/* Subtasks (Checklist) */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5 flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-ink-mute" />
              <span>Việc con (Subtasks)</span>
            </label>

            {subtasks.length > 0 && (
              <div className="space-y-1.5 mb-2 max-h-32 overflow-y-auto">
                {subtasks.map((st, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-1.5 rounded bg-canvas-cream/40 text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={st.done}
                      onChange={() => handleToggleSubtask(idx)}
                      className="rounded text-primary focus:ring-primary accent-primary"
                    />
                    <span
                      className={cn(
                        "flex-1 truncate font-medium",
                        st.done && "line-through text-ink-mute"
                      )}
                    >
                      {st.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(idx)}
                      className="text-ink-mute hover:text-semantic-error"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Thêm mục việc con..."
                className="input-base text-xs py-1.5 flex-1"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="btn-secondary-compact text-xs px-3"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              Ghi chú thêm
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Thông tin chi tiết, link tài liệu..."
              className="input-base text-sm resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-hairline">
            {initialData && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm("Bạn có chắc chắn muốn xoá task này?")) {
                    onDelete(initialData.id);
                    onClose();
                  }
                }}
                className="text-xs font-bold text-semantic-error hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" /> Xoá công việc
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
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
                disabled={isSubmitting || !title.trim()}
                className="btn-primary-compact"
              >
                {isSubmitting ? "Đang lưu..." : initialData ? "Lưu thay đổi" : "Tạo công việc"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
