"use client";

import React, { useState } from "react";
import { TaskDTO } from "@/types";
import { TaskBlock } from "./task-block";
import { formatZonedDate } from "@/lib/utils";
import { format, addDays, isSameDay } from "date-fns";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface HourlyGridProps {
  viewMode: "day" | "week" | "month";
  selectedDate: Date;
  tasks: TaskDTO[];
  onSelectSlot: (dateStr: string, startTime: string, endTime?: string) => void;
  onEditTask: (task: TaskDTO) => void;
  onToggleStatus: (task: TaskDTO) => void;
}

const HOUR_HEIGHT = 56; // 56px per hour row
const HOURS = Array.from({ length: 24 }).map((_, i) => {
  const h = i < 10 ? `0${i}` : `${i}`;
  return `${h}:00`;
});

function getMinutes(timeStr?: string | null): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

interface PositionedTask {
  task: TaskDTO;
  top: number;
  height: number;
  leftPercent: number;
  widthPercent: number;
}

function layoutDayTasks(dayTasks: TaskDTO[]): PositionedTask[] {
  if (dayTasks.length === 0) return [];

  const sorted = [...dayTasks].sort((a, b) => {
    const aStart = getMinutes(a.startTime);
    const bStart = getMinutes(b.startTime);
    if (aStart !== bStart) return aStart - bStart;
    const aEnd = a.endTime ? getMinutes(a.endTime) : aStart + 60;
    const bEnd = b.endTime ? getMinutes(b.endTime) : bStart + 60;
    return (bEnd - bStart) - (aEnd - aStart);
  });

  const columns: TaskDTO[][] = [];

  for (const task of sorted) {
    const tStart = getMinutes(task.startTime);
    let placed = false;
    for (let c = 0; c < columns.length; c++) {
      const lastInCol = columns[c][columns[c].length - 1];
      const lastEnd = lastInCol.endTime ? getMinutes(lastInCol.endTime) : getMinutes(lastInCol.startTime) + 60;
      if (tStart >= lastEnd) {
        columns[c].push(task);
        placed = true;
        break;
      }
    }
    if (!placed) {
      columns.push([task]);
    }
  }

  return sorted.map((task) => {
    const tStart = getMinutes(task.startTime);
    let tEnd = task.endTime ? getMinutes(task.endTime) : tStart + 60;
    if (tEnd <= tStart) tEnd = tStart + 60;
    const duration = tEnd - tStart;

    let colIndex = 0;
    for (let c = 0; c < columns.length; c++) {
      if (columns[c].includes(task)) {
        colIndex = c;
        break;
      }
    }

    let overlappingCols = 0;
    for (let c = 0; c < columns.length; c++) {
      const hasOverlap = columns[c].some((other) => {
        const oStart = getMinutes(other.startTime);
        let oEnd = other.endTime ? getMinutes(other.endTime) : oStart + 60;
        if (oEnd <= oStart) oEnd = oStart + 60;
        return Math.max(tStart, oStart) < Math.min(tEnd, oEnd);
      });
      if (hasOverlap) overlappingCols = Math.max(overlappingCols, c + 1);
    }
    const totalCols = Math.max(1, overlappingCols);

    const top = (tStart / 60) * HOUR_HEIGHT;
    const height = Math.max(28, (duration / 60) * HOUR_HEIGHT - 3);
    const leftPercent = (colIndex / totalCols) * 100;
    const widthPercent = (1 / totalCols) * 100;

    return {
      task,
      top,
      height,
      leftPercent,
      widthPercent,
    };
  });
}

export function HourlyGrid({
  viewMode,
  selectedDate,
  tasks,
  onSelectSlot,
  onEditTask,
  onToggleStatus,
}: HourlyGridProps) {
  // Drag-to-select time range states
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionDay, setSelectionDay] = useState<string | null>(null);
  const [startHour, setStartHour] = useState<number | null>(null);
  const [endHour, setEndHour] = useState<number | null>(null);

  // Days to render depending on view
  const days = React.useMemo(() => {
    if (viewMode === "day") {
      return [selectedDate];
    }
    if (viewMode === "week") {
      const dayOfWeek = selectedDate.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = addDays(selectedDate, diffToMonday);
      return Array.from({ length: 7 }).map((_, i) => addDays(monday, i));
    }
    return [selectedDate];
  }, [viewMode, selectedDate]);

  // Drag selection event handlers
  const handleMouseDownSlot = (dateStr: string, hourNum: number) => {
    setIsSelecting(true);
    setSelectionDay(dateStr);
    setStartHour(hourNum);
    setEndHour(hourNum);
  };

  const handleMouseEnterSlot = (dateStr: string, hourNum: number) => {
    if (isSelecting && selectionDay === dateStr) {
      setEndHour(hourNum);
    }
  };

  const handleMouseUp = () => {
    if (isSelecting && selectionDay !== null && startHour !== null && endHour !== null) {
      const minH = Math.min(startHour, endHour);
      const maxH = Math.max(startHour, endHour);

      const startFormatted = `${minH < 10 ? `0${minH}` : minH}:00`;
      const endHNum = Math.min(23, maxH + 1);
      const endFormatted = `${endHNum < 10 ? `0${endHNum}` : endHNum}:00`;

      onSelectSlot(selectionDay, startFormatted, endFormatted);
    }
    setIsSelecting(false);
    setSelectionDay(null);
    setStartHour(null);
    setEndHour(null);
  };

  return (
    <div
      className="flex flex-col bg-surface rounded-xl border border-hairline overflow-hidden shadow-sm select-none"
      onMouseUp={handleMouseUp}
    >
      {/* Desktop / Tablet Grid (≥ 768px) */}
      <div className="hidden md:flex flex-col overflow-x-auto">
        {/* Header Row: Days */}
        <div
          className="grid border-b border-hairline bg-canvas-cream/50 sticky top-0 z-20"
          style={{ gridTemplateColumns: `60px repeat(${days.length}, minmax(130px, 1fr))` }}
        >
          <div className="p-3 text-center text-xs font-bold text-ink-mute border-r border-hairline">
            Giờ
          </div>
          {days.map((d) => {
            const isToday = isSameDay(d, new Date());
            const dateStr = format(d, "yyyy-MM-dd");
            return (
              <div
                key={dateStr}
                className={cn(
                  "p-3 text-center border-r border-hairline last:border-r-0",
                  isToday && "bg-canvas-lavender/60"
                )}
              >
                <span className="text-[11px] font-bold text-ink-mute uppercase block">
                  {["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"][d.getDay()]}
                </span>
                <span
                  className={cn(
                    "text-sm font-bold mt-0.5 inline-block px-2 py-0.5 rounded-full",
                    isToday ? "bg-primary text-white" : "text-ink"
                  )}
                >
                  {format(d, "dd/MM")}
                </span>
              </div>
            );
          })}
        </div>

        {/* 24 Hours Body Grid with Accurate Multi-Hour Spanning Tasks */}
        <div className="max-h-[600px] overflow-y-auto relative">
          <div
            className="grid relative"
            style={{ gridTemplateColumns: `60px repeat(${days.length}, minmax(130px, 1fr))` }}
          >
            {/* Column 0: Time Labels */}
            <div className="flex flex-col border-r border-hairline bg-canvas select-none">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="h-[56px] p-2 text-right pr-3 text-[11px] font-semibold text-ink-mute border-b border-hairline flex items-start justify-end"
                >
                  {hour}
                </div>
              ))}
            </div>

            {/* Column 1..N: Day Columns */}
            {days.map((d) => {
              const dateStr = format(d, "yyyy-MM-dd");
              const dayTasks = tasks.filter((t) => {
                if (!t.startTime) return false;
                const tDate = formatZonedDate(t.date, "yyyy-MM-dd");
                return tDate === dateStr;
              });

              const positionedTasks = layoutDayTasks(dayTasks);

              return (
                <div
                  key={dateStr}
                  className="relative border-r border-hairline last:border-r-0 h-[1344px]"
                >
                  {/* Background 24 Hour Slots for Hover & Drag Selection */}
                  {HOURS.map((hour) => {
                    const hourNum = parseInt(hour.split(":")[0], 10);
                    const isHighlighted =
                      isSelecting &&
                      selectionDay === dateStr &&
                      startHour !== null &&
                      endHour !== null &&
                      hourNum >= Math.min(startHour, endHour) &&
                      hourNum <= Math.max(startHour, endHour);

                    return (
                      <div
                        key={`${dateStr}-${hour}`}
                        onMouseDown={() => handleMouseDownSlot(dateStr, hourNum)}
                        onMouseEnter={() => handleMouseEnterSlot(dateStr, hourNum)}
                        className={cn(
                          "h-[56px] border-b border-hairline cursor-pointer transition-colors relative group",
                          isHighlighted
                            ? "bg-canvas-lavender border-dashed border-primary/60"
                            : "hover:bg-canvas-lavender/30"
                        )}
                      >
                        {!isSelecting && (
                          <div className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center text-primary/60 text-[10px] font-bold pointer-events-none">
                            + Kéo để chọn giờ
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Foreground Positioned Task Blocks (Spans full height from startTime to endTime) */}
                  {positionedTasks.map(({ task, top, height, leftPercent, widthPercent }) => (
                    <div
                      key={task.id}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="absolute z-10 px-1 py-0.5"
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                    >
                      <TaskBlock
                        task={task}
                        onEdit={onEditTask}
                        onToggleStatus={onToggleStatus}
                        className="h-full w-full"
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Scrollable Timeline View (< 768px) */}
      <div className="md:hidden flex flex-col p-3 space-y-4 max-h-[600px] overflow-y-auto">
        {days.map((d) => {
          const dateStr = format(d, "yyyy-MM-dd");
          const dayTasks = tasks.filter(
            (t) => formatZonedDate(t.date, "yyyy-MM-dd") === dateStr && t.startTime
          );

          return (
            <div key={dateStr} className="space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-hairline">
                <span className="font-bold text-xs text-ink">
                  {formatZonedDate(dateStr, "EEEE, dd/MM/yyyy")}
                </span>
                <button
                  type="button"
                  onClick={() => onSelectSlot(dateStr, "09:00", "10:00")}
                  className="text-xs font-bold text-primary flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm task
                </button>
              </div>

              {dayTasks.length === 0 ? (
                <div className="py-3 text-center text-xs text-ink-mute bg-canvas-cream/30 rounded-lg">
                  Không có lịch trong ngày
                </div>
              ) : (
                <div className="space-y-1.5">
                  {dayTasks.map((t) => (
                    <TaskBlock
                      key={t.id}
                      task={t}
                      onEdit={onEditTask}
                      onToggleStatus={onToggleStatus}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

