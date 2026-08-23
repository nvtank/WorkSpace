"use client";

import React, { useState } from "react";
import { TaskDTO } from "@/types";
import { TaskBlock } from "./task-block";
import { Inbox, Plus, Sparkles } from "lucide-react";

interface BacklogPanelProps {
  tasks: TaskDTO[];
  onEditTask: (task: TaskDTO) => void;
  onToggleStatus: (task: TaskDTO) => void;
  onQuickAddTask: (title: string) => void;
  onAssignTimeToTask: (task: TaskDTO) => void;
}

export function BacklogPanel({
  tasks,
  onEditTask,
  onToggleStatus,
  onQuickAddTask,
  onAssignTimeToTask,
}: BacklogPanelProps) {
  const [quickTitle, setQuickTitle] = useState("");

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    onQuickAddTask(quickTitle.trim());
    setQuickTitle("");
  };

  const backlogTasks = tasks.filter((t) => !t.startTime);

  return (
    <div className="card-base flex flex-col h-full bg-surface border border-hairline p-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-hairline mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-canvas-lavender text-primary flex items-center justify-center">
            <Inbox className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-ink">Backlog / Inbox</h3>
            <span className="text-[10px] text-ink-mute">
              {backlogTasks.length} task chưa gán giờ
            </span>
          </div>
        </div>
      </div>

      {/* Quick Add input */}
      <form onSubmit={handleQuickAdd} className="mb-3 flex gap-2">
        <input
          type="text"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder="Thêm nhanh vào Backlog..."
          className="input-base text-xs py-1.5 flex-1"
        />
        <button
          type="submit"
          disabled={!quickTitle.trim()}
          className="btn-primary-compact text-xs px-3"
          title="Thêm"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[150px]">
        {backlogTasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-xs text-ink-mute">
            <Sparkles className="w-6 h-6 text-primary/40 mb-1.5" />
            <p>Backlog trống!</p>
            <p className="text-[11px] text-ink-mute mt-0.5">
              Ghi nhanh các việc chưa xác định giờ vào đây
            </p>
          </div>
        ) : (
          backlogTasks.map((task) => (
            <div key={task.id} className="relative group">
              <TaskBlock
                task={task}
                onEdit={onEditTask}
                onToggleStatus={onToggleStatus}
              />
              <button
                type="button"
                onClick={() => onAssignTimeToTask(task)}
                className="absolute right-2 top-2 text-[10px] font-bold text-primary bg-canvas-lavender hover:bg-canvas-lavender/80 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Gán giờ
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
