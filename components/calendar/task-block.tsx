"use client";

import React from "react";
import { TaskDTO } from "@/types";
import { DESIGN_TOKENS } from "@/lib/constants/design-tokens";
import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskBlockProps {
  task: TaskDTO;
  onEdit: (task: TaskDTO) => void;
  onToggleStatus: (task: TaskDTO) => void;
  isDragging?: boolean;
  className?: string;
}

export function TaskBlock({
  task,
  onEdit,
  onToggleStatus,
  isDragging = false,
  className,
}: TaskBlockProps) {
  const isDone = task.status === "done";
  
  // Check if task is overdue
  const isOverdue = !isDone && (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(task.date);
    taskDate.setHours(0, 0, 0, 0);
    
    // If task has end time, compare full datetime
    if (task.endTime) {
      const [hours, minutes] = task.endTime.split(':').map(Number);
      taskDate.setHours(hours, minutes, 0, 0);
      return taskDate < new Date();
    }
    
    // Otherwise, just compare dates
    return taskDate < today;
  })();
  
  const priorityColor =
    DESIGN_TOKENS.priorityColors[task.priority] || DESIGN_TOKENS.priorityColors.medium;

  return (
    <div
      onClick={() => onEdit(task)}
      className={cn(
        "group relative p-2 rounded-lg border text-xs cursor-pointer transition-all duration-150 select-none flex flex-col justify-between overflow-hidden",
        isDone
          ? "bg-canvas-lavender/50 border-semantic-success/30 text-ink/70 line-through"
          : "bg-surface border-hairline hover:border-primary/50 text-ink shadow-xs hover:shadow-sm",
        isDragging && "opacity-60 shadow-elevation2 scale-[1.02]",
        className
      )}
      style={{
        borderLeftWidth: "4px",
        borderLeftColor: isDone ? DESIGN_TOKENS.colors.semanticSuccess : task.color || priorityColor,
      }}
    >
      <div className="flex items-start justify-between gap-1.5">
        <div className="flex items-start gap-1.5 flex-1 min-w-0">
          {/* Status Checkbox toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus(task);
            }}
            className="text-ink-mute hover:text-primary mt-0.5 flex-shrink-0 transition-colors"
          >
            {isDone ? (
              <CheckCircle2 className="w-4 h-4 text-semantic-success" />
            ) : (
              <Circle className="w-4 h-4 text-ink-mute group-hover:text-primary" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className={cn("font-bold truncate text-xs", isDone && "line-through text-ink-mute")}>
                {task.title}
              </p>
              {/* Overdue indicator */}
              {isOverdue && (
                <div title="Quá hạn">
                  <AlertCircle 
                    className="w-3.5 h-3.5 flex-shrink-0" 
                    style={{ color: DESIGN_TOKENS.statusColors.overdue }}
                  />
                </div>
              )}
            </div>

            {/* Time / Description info */}
            {task.startTime && (
              <div className="flex items-center gap-1 text-[10px] text-ink-mute mt-0.5">
                <Clock className="w-3 h-3" />
                <span>
                  {task.startTime}
                  {task.endTime ? ` - ${task.endTime}` : ""}
                </span>
              </div>
            )}

            {/* Subtasks summary */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="text-[10px] text-ink-mute mt-0.5">
                {task.subtasks.filter((s) => s.done).length}/{task.subtasks.length} việc con
              </div>
            )}
          </div>
        </div>

        {/* Priority dot indicator */}
        <div
          className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
          style={{ backgroundColor: priorityColor }}
          title={`Độ ưu tiên: ${task.priority}`}
        />
      </div>
    </div>
  );
}
