"use client";

import React, { useState, useMemo } from "react";
import { TrackerDTO, TrackerEntryDTO } from "@/types";
import { TrackerChart } from "./tracker-chart";
import {
  formatCurrencyVND,
  formatNumber,
  formatZonedDate,
} from "@/lib/utils";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  subWeeks,
  subMonths,
  isWithinInterval,
  parseISO,
  format,
} from "date-fns";
import {
  Plus,
  MoreVertical,
  TrendingUp,
  TrendingDown,
  Edit2,
  Trash2,
  Activity,
  Waves,
  Dumbbell,
  BookOpen,
  Wallet,
  Heart,
  Flame,
  Coffee,
  Moon,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, any> = {
  Activity,
  Waves,
  Dumbbell,
  BookOpen,
  Wallet,
  Heart,
  Flame,
  Coffee,
  Moon,
  Sparkles,
};

interface TrackerWidgetProps {
  tracker: TrackerDTO;
  entries: TrackerEntryDTO[];
  onOpenLog: (tracker: TrackerDTO) => void;
  onEditTracker: (tracker: TrackerDTO) => void;
  onDeleteTracker: (trackerId: string) => void;
  dragHandleProps?: any;
}

export function TrackerWidget({
  tracker,
  entries,
  onOpenLog,
  onEditTracker,
  onDeleteTracker,
  dragHandleProps,
}: TrackerWidgetProps) {
  const [period, setPeriod] = useState<"day" | "week" | "month">("week");
  const [menuOpen, setMenuOpen] = useState(false);

  const trackerEntries = useMemo(() => {
    return entries.filter((e) => e.trackerId === tracker.id);
  }, [entries, tracker.id]);

  // Calculate aggregation & comparison
  const stats = useMemo(() => {
    const now = new Date();

    let currentStart: Date;
    let currentEnd: Date;
    let priorStart: Date;
    let priorEnd: Date;

    if (period === "day") {
      currentStart = startOfDay(now);
      currentEnd = endOfDay(now);
      priorStart = startOfDay(subDays(now, 1));
      priorEnd = endOfDay(subDays(now, 1));
    } else if (period === "week") {
      currentStart = startOfWeek(now, { weekStartsOn: 1 });
      currentEnd = endOfWeek(now, { weekStartsOn: 1 });
      priorStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
      priorEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    } else {
      currentStart = startOfMonth(now);
      currentEnd = endOfMonth(now);
      priorStart = startOfMonth(subMonths(now, 1));
      priorEnd = endOfMonth(subMonths(now, 1));
    }

    let currentTotal = 0;
    let priorTotal = 0;
    const categoryTotals: Record<string, number> = {};

    trackerEntries.forEach((entry) => {
      const entryDate = parseISO(entry.date);
      if (isWithinInterval(entryDate, { start: currentStart, end: currentEnd })) {
        currentTotal += entry.value;
        if (tracker.unitType === "currency" && entry.category) {
          categoryTotals[entry.category] = (categoryTotals[entry.category] || 0) + entry.value;
        }
      } else if (isWithinInterval(entryDate, { start: priorStart, end: priorEnd })) {
        priorTotal += entry.value;
      }
    });

    let percentChange = 0;
    if (priorTotal > 0) {
      percentChange = Math.round(((currentTotal - priorTotal) / priorTotal) * 100);
    } else if (currentTotal > 0) {
      percentChange = 100;
    }

    // Prepare chart data points
    let chartData: Array<{ name: string; value: number }> = [];

    if (period === "day") {
      // Last 7 days trend
      chartData = Array.from({ length: 7 }).map((_, i) => {
        const d = subDays(now, 6 - i);
        const dayStart = startOfDay(d);
        const dayEnd = endOfDay(d);
        const val = trackerEntries
          .filter((e) => isWithinInterval(parseISO(e.date), { start: dayStart, end: dayEnd }))
          .reduce((acc, curr) => acc + curr.value, 0);
        return { name: format(d, "dd/MM"), value: val };
      });
    } else if (period === "week") {
      // 7 days of current week
      chartData = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(currentStart);
        d.setDate(currentStart.getDate() + i);
        const dayStart = startOfDay(d);
        const dayEnd = endOfDay(d);
        const val = trackerEntries
          .filter((e) => isWithinInterval(parseISO(e.date), { start: dayStart, end: dayEnd }))
          .reduce((acc, curr) => acc + curr.value, 0);
        return { name: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"][i], value: val };
      });
    } else {
      // 4 weeks of current month
      chartData = [
        { name: "T1", value: 0 },
        { name: "T2", value: 0 },
        { name: "T3", value: 0 },
        { name: "T4", value: 0 },
      ];
      trackerEntries.forEach((e) => {
        const entryDate = parseISO(e.date);
        if (isWithinInterval(entryDate, { start: currentStart, end: currentEnd })) {
          const dayOfMonth = entryDate.getDate();
          const weekIdx = Math.min(3, Math.floor((dayOfMonth - 1) / 7));
          chartData[weekIdx].value += e.value;
        }
      });
    }

    // Donut chart data for currency
    const donutData = Object.entries(categoryTotals).map(([cat, val]) => ({
      name: cat,
      value: val,
    }));

    return {
      currentTotal,
      priorTotal,
      percentChange,
      chartData,
      donutData,
    };
  }, [period, trackerEntries, tracker.unitType]);

  const IconComponent = ICON_MAP[tracker.icon] || Activity;

  // Format value display
  const displayTotal =
    tracker.unitType === "currency"
      ? formatCurrencyVND(stats.currentTotal)
      : `${formatNumber(stats.currentTotal)} ${tracker.unitLabel || ""}`.trim();

  return (
    <div className="card-base flex flex-col justify-between relative group hover:shadow-elevation1 transition-all duration-200">
      {/* Card Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            {...dragHandleProps}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm cursor-grab active:cursor-grabbing transition-transform group-hover:scale-105"
            style={{ backgroundColor: tracker.color }}
          >
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-ink leading-tight">{tracker.name}</h3>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
              {tracker.unitType === "duration"
                ? "Thời lượng"
                : tracker.unitType === "currency"
                ? "Chi tiêu"
                : tracker.unitType === "count"
                ? "Đếm số lần"
                : "Tuỳ chỉnh"}
            </span>
          </div>
        </div>

        {/* Action Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-ink-mute hover:text-ink p-1 rounded hover:bg-canvas-lavender"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-7 w-36 bg-surface rounded-lg border border-hairline shadow-elevation2 py-1 z-20 text-xs font-semibold"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEditTracker(tracker);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-ink hover:bg-canvas-lavender hover:text-primary text-left"
              >
                <Edit2 className="w-3.5 h-3.5" /> Sửa tracker
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDeleteTracker(tracker.id);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-semantic-error hover:bg-semantic-error/10 text-left"
              >
                <Trash2 className="w-3.5 h-3.5" /> Lưu trữ
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Period Tabs */}
      <div className="flex items-center gap-1 p-1 bg-canvas-cream/50 rounded-pill border border-hairline w-fit mb-3">
        {(["day", "week", "month"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={cn(
              "px-3 py-1 text-xs font-bold rounded-pill transition-all",
              period === p
                ? "bg-canvas text-primary shadow-sm"
                : "text-ink-mute hover:text-ink"
            )}
          >
            {p === "day" ? "Hôm nay" : p === "week" ? "Tuần này" : "Tháng này"}
          </button>
        ))}
      </div>

      {/* Metric Stat & Comparison */}
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <span className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
            {displayTotal}
          </span>
        </div>

        {/* % Comparison Badge */}
        {stats.percentChange !== 0 && (
          <div
            className={cn(
              "inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-pill",
              stats.percentChange > 0
                ? "bg-semantic-success/15 text-semantic-success"
                : "bg-semantic-error/15 text-semantic-error"
            )}
          >
            {stats.percentChange > 0 ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>
              {stats.percentChange > 0 ? `+${stats.percentChange}%` : `${stats.percentChange}%`}
            </span>
          </div>
        )}
      </div>

      {/* Goal Progress Bar if configured */}
      {tracker.goal && tracker.goal.targetValue > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-[11px] font-semibold text-ink-mute mb-1">
            <span>
              Mục tiêu: {tracker.goal.targetValue} {tracker.unitLabel} /{" "}
              {tracker.goal.period === "daily"
                ? "ngày"
                : tracker.goal.period === "weekly"
                ? "tuần"
                : "tháng"}
            </span>
            <span>
              {Math.min(
                100,
                Math.round((stats.currentTotal / tracker.goal.targetValue) * 100)
              )}
              %
            </span>
          </div>
          <div className="w-full h-2 bg-canvas-cream rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  (stats.currentTotal / tracker.goal.targetValue) * 100
                )}%`,
                backgroundColor: tracker.color,
              }}
            />
          </div>
        </div>
      )}

      {/* Chart visualization */}
      <div className="my-2">
        {tracker.unitType === "currency" && stats.donutData.length > 0 ? (
          <TrackerChart
            type="donut"
            data={stats.donutData}
            unitType="currency"
          />
        ) : (
          <TrackerChart
            type={period === "week" ? "bar" : "line"}
            data={stats.chartData}
            color={tracker.color}
            unitType={tracker.unitType}
            unitLabel={tracker.unitLabel}
          />
        )}
      </div>

      {/* Footer Quick Log Button */}
      <div className="pt-3 border-t border-hairline mt-2 flex items-center justify-between">
        <span className="text-xs text-ink-mute">
          {trackerEntries.length} lượt ghi
        </span>
        <button
          type="button"
          onClick={() => onOpenLog(tracker)}
          className="btn-primary-compact inline-flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Log nhanh</span>
        </button>
      </div>
    </div>
  );
}
