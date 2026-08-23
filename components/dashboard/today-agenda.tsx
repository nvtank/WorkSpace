"use client";

import React from "react";
import { useTasks } from "@/hooks/use-tasks";
import { useNotes } from "@/hooks/use-notes";
import { TaskDTO } from "@/types";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  ArrowRight,
  FileText,
  Pin,
  Sparkles,
  ListTodo,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function TodayAgenda() {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const { tasks, updateTask } = useTasks({ date: todayStr });
  const { notes } = useNotes();

  const todayTasks = tasks;
  const completedCount = todayTasks.filter((t) => t.status === "done").length;
  const totalCount = todayTasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Pinned or recent notes
  const pinnedOrRecentNotes = notes.slice(0, 3);

  const handleToggleTask = (task: TaskDTO) => {
    const nextStatus = task.status === "done" ? "todo" : "done";
    updateTask({ id: task.id, data: { status: nextStatus } });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 2 Cols: Today's Tasks & Schedule */}
      <div className="lg:col-span-2 card-base bg-surface p-6 border border-hairline shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-hairline">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ListTodo className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-ink">Công Việc & Lịch Hôm Nay</h3>
              <p className="text-xs text-ink-mute">
                {format(new Date(), "EEEE, 'ngày' dd 'tháng' MM, yyyy")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary">
              {completedCount}/{totalCount} hoàn thành ({progressPercent}%)
            </span>
            <Link
              href="/calendar"
              className="btn-secondary-compact text-xs inline-flex items-center gap-1"
            >
              <span>Xem Lịch</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="w-full bg-canvas-cream h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Task list */}
        {todayTasks.length === 0 ? (
          <div className="py-8 text-center bg-canvas-cream/30 rounded-xl border border-dashed border-hairline space-y-2">
            <CalendarDays className="w-8 h-8 text-ink-mute mx-auto opacity-50" />
            <p className="text-xs text-ink-mute font-medium">
              Chưa có task nào được lên lịch cho hôm nay
            </p>
            <Link
              href="/calendar"
              className="btn-primary-compact text-xs inline-flex items-center gap-1.5 mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Lên lịch task ngay</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {todayTasks.map((t) => {
              const isDone = t.status === "done";

              return (
                <div
                  key={t.id}
                  className={cn(
                    "p-3 rounded-xl border border-hairline flex items-center justify-between gap-3 transition-all",
                    isDone ? "bg-canvas-cream/20 opacity-70" : "bg-canvas hover:border-primary/40 shadow-xs"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleTask(t)}
                      className={cn(
                        "flex-shrink-0 transition-transform active:scale-90",
                        isDone ? "text-semantic-success" : "text-ink-mute hover:text-primary"
                      )}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 fill-semantic-success/20" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <p
                        className={cn(
                          "text-xs sm:text-sm font-bold text-ink truncate",
                          isDone && "line-through text-ink-mute font-normal"
                        )}
                      >
                        {t.title}
                      </p>
                      {t.description && (
                        <p className="text-[11px] text-ink-mute truncate">
                          {t.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {t.startTime && (
                      <span className="text-[11px] font-semibold text-ink-mute bg-canvas-cream px-2 py-0.5 rounded-pill flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {t.startTime}
                          {t.endTime ? ` - ${t.endTime}` : ""}
                        </span>
                      </span>
                    )}

                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-pill text-white",
                        t.priority === "high"
                          ? "bg-semantic-error"
                          : t.priority === "medium"
                          ? "bg-primary"
                          : "bg-ink-mute"
                      )}
                    >
                      {t.priority === "high"
                        ? "Cao"
                        : t.priority === "medium"
                        ? "Vừa"
                        : "Thấp"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 1 Col: Quick Notes & Pinned Reminders */}
      <div className="card-base bg-surface p-6 border border-hairline shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-hairline">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-base text-ink">Ghi Chú Nhanh</h3>
          </div>

          <Link
            href="/notes"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>Tất cả</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {pinnedOrRecentNotes.length === 0 ? (
          <div className="py-6 text-center text-xs text-ink-mute bg-canvas-cream/30 rounded-xl">
            Chưa có ghi chú nào
          </div>
        ) : (
          <div className="space-y-2.5 max-h-72 overflow-y-auto">
            {pinnedOrRecentNotes.map((n) => {
              const textOnly = n.content
                ? n.content.replace(/<[^>]*>?/gm, " ").trim()
                : "Ghi chú trống";
              const firstLine = textOnly.split("\n")[0].substring(0, 40);

              return (
                <Link
                  key={n.id}
                  href="/notes"
                  className="block p-3 rounded-xl bg-canvas border border-hairline hover:border-primary/40 transition-colors shadow-xs group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-xs text-ink group-hover:text-primary transition-colors truncate">
                      {firstLine || "Ghi chú"}
                    </h4>
                    {n.isPinned && <Pin className="w-3 h-3 text-sand flex-shrink-0" />}
                  </div>
                  <p className="text-[11px] text-ink-mute line-clamp-2">
                    {textOnly}
                  </p>
                  {n.tags && n.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {n.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-pill bg-canvas-cream text-ink-mute"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        <Link
          href="/notes"
          className="btn-outline-compact w-full text-xs flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tạo ghi chú mới</span>
        </Link>
      </div>
    </div>
  );
}
