"use client";

import React, { useState } from "react";
import { TaskDTO } from "@/types";
import { HourlyGrid } from "./hourly-grid";
import { BacklogPanel } from "./backlog-panel";
import { TaskBlock } from "./task-block";
import { CopyDayDialog } from "./copy-day-dialog";
import { TaskTemplateDialog } from "./task-template-dialog";
import { TaskFormDialog } from "./task-form-dialog";
import { useTaskTemplates } from "@/hooks/use-tasks";
import { formatZonedDate } from "@/lib/utils";
import {
  format,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Copy,
  BookmarkPlus,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
  viewMode: "day" | "week" | "month";
  currentDate: Date;
  onViewModeChange: (mode: "day" | "week" | "month") => void;
  onDateChange: (date: Date) => void;
  tasks: TaskDTO[];
  isLoading?: boolean;
  onCreateTask: (data: Partial<TaskDTO>) => Promise<any>;
  onUpdateTask: (params: { id: string; data: Partial<TaskDTO> }) => Promise<any>;
  onDeleteTask: (id: string) => Promise<any>;
  onCopyDay: (payload: any) => Promise<any>;
}

export function CalendarView({
  viewMode,
  currentDate,
  onViewModeChange,
  onDateChange,
  tasks,
  isLoading,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onCopyDay,
}: CalendarViewProps) {
  // Dialogs
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskDTO | null>(null);
  const [selectedSlotDate, setSelectedSlotDate] = useState<string>("");
  const [selectedSlotTime, setSelectedSlotTime] = useState<string>("");
  const [selectedSlotEndTime, setSelectedSlotEndTime] = useState<string>("");

  const [copyDayOpen, setCopyDayOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);

  const {
    templates,
    createTemplate,
    applyTemplate,
    deleteTemplate,
  } = useTaskTemplates();

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === "day") onDateChange(subDays(currentDate, 1));
    else if (viewMode === "week") onDateChange(subWeeks(currentDate, 1));
    else onDateChange(subMonths(currentDate, 1));
  };

  const handleNext = () => {
    if (viewMode === "day") onDateChange(addDays(currentDate, 1));
    else if (viewMode === "week") onDateChange(addWeeks(currentDate, 1));
    else onDateChange(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  // Slot click / drag select
  const handleSelectSlot = (dateStr: string, startTime: string, endTime?: string) => {
    setEditingTask(null);
    setSelectedSlotDate(dateStr);
    setSelectedSlotTime(startTime);
    setSelectedSlotEndTime(endTime || "");
    setTaskFormOpen(true);
  };

  // Task actions
  const handleEditTask = (task: TaskDTO) => {
    setEditingTask(task);
    setSelectedSlotDate(formatZonedDate(task.date, "yyyy-MM-dd"));
    setSelectedSlotTime(task.startTime || "09:00");
    setTaskFormOpen(true);
  };

  const handleToggleStatus = (task: TaskDTO) => {
    const nextStatus = task.status === "done" ? "todo" : "done";
    onUpdateTask({ id: task.id, data: { status: nextStatus } });
  };

  const handleFormSubmit = async (data: Partial<TaskDTO>) => {
    if (editingTask) {
      await onUpdateTask({ id: editingTask.id, data });
    } else {
      await onCreateTask(data);
    }
  };

  const handleQuickAddBacklog = async (title: string) => {
    await onCreateTask({
      title,
      date: format(currentDate, "yyyy-MM-dd"),
      startTime: null,
      endTime: null,
      priority: "medium",
      status: "todo",
    });
  };

  const currentDateStr = format(currentDate, "yyyy-MM-dd");
  const currentDayTasks = tasks.filter(
    (t) => formatZonedDate(t.date, "yyyy-MM-dd") === currentDateStr
  );

  // Month view day cells
  const monthDays = React.useMemo(() => {
    if (viewMode !== "month") return [];
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [viewMode, currentDate]);

  // Quick stats - use all tasks in current view range
  const statsLabel = viewMode === "day" ? "hôm nay" : viewMode === "week" ? "tuần này" : "tháng này";
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const pendingCount = tasks.filter((t) => t.status !== "done").length;
  const highPriorityCount = tasks.filter((t) => t.priority === "high").length;

  return (
    <div className="space-y-6 pb-20">
      {/* 4-Column Quick Number Stats for Calendar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="card-base bg-surface p-4 border border-hairline shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-ink-mute block">Tổng {statsLabel}</span>
            <span className="text-xl sm:text-2xl font-black text-ink">{tasks.length} task</span>
          </div>
        </div>

        <div className="card-base bg-surface p-4 border border-hairline shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-semantic-success/15 text-semantic-success flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-ink-mute block">Đã Hoàn Thành</span>
            <span className="text-xl sm:text-2xl font-black text-semantic-success">{doneCount} task</span>
          </div>
        </div>

        <div className="card-base bg-surface p-4 border border-hairline shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-canvas-lavender text-primary flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-ink-mute block">Đang Chờ Làm</span>
            <span className="text-xl sm:text-2xl font-black text-primary">{pendingCount} task</span>
          </div>
        </div>

        <div className="card-base bg-surface p-4 border border-hairline shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-semantic-error/15 text-semantic-error flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-ink-mute block">Ưu Tiên Cao</span>
            <span className="text-xl sm:text-2xl font-black text-semantic-error">{highPriorityCount} task</span>
          </div>
        </div>
      </div>

      {/* Calendar Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface p-5 rounded-2xl border border-hairline shadow-sm">
        {/* Date Navigator */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToday}
            className="btn-outline-compact text-xs font-bold"
          >
            Hôm nay
          </button>
          <div className="flex items-center gap-1 bg-canvas-cream/50 p-1 rounded-pill border border-hairline">
            <button
              type="button"
              onClick={handlePrev}
              className="w-7 h-7 rounded-full flex items-center justify-center text-ink-mute hover:text-ink hover:bg-canvas transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="w-7 h-7 rounded-full flex items-center justify-center text-ink-mute hover:text-ink hover:bg-canvas transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-lg sm:text-2xl font-black text-ink tracking-tight ml-1">
            {viewMode === "month"
              ? format(currentDate, "MMMM yyyy")
              : viewMode === "day"
              ? formatZonedDate(currentDate, "EEEE, dd/MM/yyyy")
              : `Tuần ${format(currentDate, "w")} • ${format(currentDate, "MMMM yyyy")}`}
          </h2>
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View mode buttons */}
          <div className="flex items-center gap-1 bg-canvas-cream/50 p-1 rounded-pill border border-hairline">
            {(["day", "week", "month"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onViewModeChange(mode)}
                className={cn(
                  "px-3 py-1 text-xs font-bold rounded-pill transition-all",
                  viewMode === mode
                    ? "bg-canvas text-primary shadow-sm"
                    : "text-ink-mute hover:text-ink"
                )}
              >
                {mode === "day" ? "Ngày" : mode === "week" ? "Tuần" : "Tháng"}
              </button>
            ))}
          </div>

          {/* Copy Day Button */}
          <button
            type="button"
            onClick={() => setCopyDayOpen(true)}
            className="btn-secondary-compact inline-flex items-center gap-1.5"
            title="Sao chép toàn bộ task ngày này sang ngày khác"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Day</span>
          </button>

          {/* Template Button */}
          <button
            type="button"
            onClick={() => setTemplateOpen(true)}
            className="btn-secondary-compact inline-flex items-center gap-1.5"
            title="Lưu hoặc áp dụng template ngày chuẩn"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>Templates</span>
          </button>

          {/* Add Task Button */}
          <button
            type="button"
            onClick={() => {
              setEditingTask(null);
              setSelectedSlotDate(currentDateStr);
              setSelectedSlotTime("09:00");
              setTaskFormOpen(true);
            }}
            className="btn-primary-compact inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Task</span>
          </button>
        </div>
      </div>

      {/* Main Grid & Backlog Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Hourly Grid or Month View (3 cols) */}
        <div className="lg:col-span-3">
          {viewMode === "month" ? (
            <div className="bg-surface rounded-xl border border-hairline p-4 shadow-sm">
              <div className="grid grid-cols-7 gap-2">
                {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((dayName) => (
                  <div
                    key={dayName}
                    className="p-2 text-center text-xs font-bold text-ink-mute bg-canvas-cream/40 rounded-lg"
                  >
                    {dayName}
                  </div>
                ))}

                {monthDays.map((d) => {
                  const dateStr = format(d, "yyyy-MM-dd");
                  const dayTasks = tasks.filter(
                    (t) => formatZonedDate(t.date, "yyyy-MM-dd") === dateStr
                  );
                  const isToday = isSameDay(d, new Date());

                  return (
                    <div
                      key={dateStr}
                      onClick={() => handleSelectSlot(dateStr, "09:00")}
                      className={cn(
                        "min-h-[100px] p-1.5 rounded-lg border border-hairline hover:border-primary/50 transition-colors cursor-pointer flex flex-col justify-between",
                        isToday ? "bg-canvas-lavender/40 border-primary/40" : "bg-canvas"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            "text-xs font-bold px-1.5 py-0.5 rounded",
                            isToday ? "bg-primary text-white" : "text-ink"
                          )}
                        >
                          {format(d, "d")}
                        </span>
                        <span className="text-[10px] text-ink-mute">
                          {dayTasks.length > 0 ? `${dayTasks.length} task` : ""}
                        </span>
                      </div>

                      <div className="space-y-1 mt-1 overflow-hidden">
                        {dayTasks.slice(0, 2).map((t) => (
                          <div
                            key={t.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTask(t);
                            }}
                            className="text-[10px] font-semibold truncate px-1.5 py-0.5 rounded bg-canvas-cream text-ink border border-hairline"
                          >
                            {t.startTime ? `${t.startTime} ` : ""}{t.title}
                          </div>
                        ))}
                        {dayTasks.length > 2 && (
                          <div className="text-[9px] font-bold text-primary pl-1">
                            +{dayTasks.length - 2} task khác
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <HourlyGrid
              viewMode={viewMode}
              selectedDate={currentDate}
              tasks={tasks}
              onSelectSlot={handleSelectSlot}
              onEditTask={handleEditTask}
              onToggleStatus={handleToggleStatus}
            />
          )}
        </div>

        {/* Backlog Panel (1 col) */}
        <div className="lg:col-span-1">
          <BacklogPanel
            tasks={tasks}
            onEditTask={handleEditTask}
            onToggleStatus={handleToggleStatus}
            onQuickAddTask={handleQuickAddBacklog}
            onAssignTimeToTask={(task) => {
              setEditingTask(task);
              setSelectedSlotDate(formatZonedDate(task.date, "yyyy-MM-dd"));
              setSelectedSlotTime("09:00");
              setTaskFormOpen(true);
            }}
          />
        </div>
      </div>

      {/* Task Form Dialog */}
      <TaskFormDialog
        isOpen={taskFormOpen}
        onClose={() => setTaskFormOpen(false)}
        onSubmit={handleFormSubmit}
        onDelete={onDeleteTask}
        initialData={editingTask}
        defaultDate={selectedSlotDate}
        defaultStartTime={selectedSlotTime}
        defaultEndTime={selectedSlotEndTime}
      />

      {/* Copy Day Dialog */}
      <CopyDayDialog
        isOpen={copyDayOpen}
        onClose={() => setCopyDayOpen(false)}
        sourceDate={currentDateStr}
        onCopy={onCopyDay}
      />

      {/* Task Template Dialog */}
      <TaskTemplateDialog
        isOpen={templateOpen}
        onClose={() => setTemplateOpen(false)}
        currentDayTasks={currentDayTasks}
        targetDate={currentDateStr}
        templates={templates}
        onCreateTemplate={createTemplate}
        onApplyTemplate={applyTemplate}
        onDeleteTemplate={deleteTemplate}
      />
    </div>
  );
}
