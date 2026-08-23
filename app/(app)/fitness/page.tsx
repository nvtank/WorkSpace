"use client";

import React, { useState, useMemo } from "react";
import { useTrackers, useTrackerEntries } from "@/hooks/use-trackers";
import { formatZonedDate } from "@/lib/utils";
import {
  Dumbbell,
  Waves,
  Flame,
  Plus,
  Clock,
  Calendar,
  Activity,
  Trash2,
  Trophy,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  parseISO,
  isSameDay,
} from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const WORKOUT_ACTIVITIES = [
  { name: "Gym / Thể hình", icon: Dumbbell, color: "#F0A875" },
  { name: "Bơi lội", icon: Waves, color: "#6E93B5" },
  { name: "Chạy bộ", icon: Activity, color: "#8CA88A" },
  { name: "Cầu lông", icon: Activity, color: "#D9A441" },
  { name: "Bóng đá", icon: Activity, color: "#007a5a" },
  { name: "Khác", icon: Flame, color: "#4a154b" },
];

export default function FitnessPage() {
  const { trackers } = useTrackers();
  const fitnessTracker =
    trackers.find((t) => t.unitType === "duration" || t.name.toLowerCase().includes("thể thao")) ||
    trackers[0];

  const { entries, logEntry, deleteEntry, isLogging } = useTrackerEntries({
    trackerId: fitnessTracker?.id,
  });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activity, setActivity] = useState("Gym / Thể hình");
  const [duration, setDuration] = useState<number | "">(45);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  // Weekly stats & True Consecutive Days Streak
  const { chartData, totalMinutes, workoutCount, currentStreak } = useMemo(() => {
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: 1 });
    const end = endOfWeek(now, { weekStartsOn: 1 });

    const weekDays = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dKey = format(d, "yyyy-MM-dd");
      const dayName = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"][i];
      return {
        dateStr: dKey,
        dayName,
        label: `${dayName} (${format(d, "dd/MM")})`,
        minutes: 0,
        items: [] as Array<{ category: string; value: number; note: string }>,
      };
    });

    let total = 0;
    let count = 0;

    // Distinct dates set for streak calculation
    const activeDatesSet = new Set<string>();

    entries.forEach((e) => {
      const d = parseISO(e.date);
      const dKey = format(d, "yyyy-MM-dd");
      activeDatesSet.add(dKey);

      if (isWithinInterval(d, { start, end })) {
        total += e.value;
        count++;
        const found = weekDays.find((w) => w.dateStr === dKey);
        if (found) {
          found.minutes += e.value;
          found.items.push({
            category: e.category || "Tập luyện",
            value: e.value,
            note: e.note || "",
          });
        }
      }
    });

    // Accurate Streak Calculation:
    // Check if user worked out today or yesterday, then count backwards consecutive days
    let streak = 0;
    const todayStr = format(now, "yyyy-MM-dd");
    const yesterdayStr = format(subDays(now, 1), "yyyy-MM-dd");

    let checkDate = activeDatesSet.has(todayStr)
      ? now
      : activeDatesSet.has(yesterdayStr)
      ? subDays(now, 1)
      : null;

    if (checkDate) {
      while (true) {
        const key = format(checkDate, "yyyy-MM-dd");
        if (activeDatesSet.has(key)) {
          streak++;
          checkDate = subDays(checkDate, 1);
        } else {
          break;
        }
      }
    }

    return {
      chartData: weekDays,
      totalMinutes: total,
      workoutCount: count,
      currentStreak: streak,
    };
  }, [entries]);

  const handleAddWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!duration || duration <= 0) return;

    if (!fitnessTracker) {
      toast.error("Chưa có tracker thể thao");
      return;
    }

    await logEntry({
      trackerId: fitnessTracker.id,
      value: Number(duration),
      category: activity,
      note: note.trim() || activity,
      date,
    });

    setNote("");
    setIsAddOpen(false);
  };

  // Custom Rich Tooltip for Fitness Bar Chart
  const CustomFitnessTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      return (
        <div className="bg-surface p-3.5 rounded-xl border border-hairline shadow-elevation2 text-xs min-w-[220px]">
          <div className="flex items-center justify-between pb-2 border-b border-hairline mb-2">
            <span className="font-bold text-ink">{data.label}</span>
            <span className="font-bold text-primary text-sm">
              {data.minutes} phút
            </span>
          </div>

          {data.items && data.items.length > 0 ? (
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-ink-mute block">
                Chi tiết các bài tập:
              </span>
              {data.items.map((item: any, idx: number) => (
                <div key={idx} className="bg-canvas-cream/40 p-2 rounded-lg border border-hairline/60">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-ink">{item.category}</span>
                    <span className="font-bold text-primary">{item.value} phút</span>
                  </div>
                  {item.note && item.note !== item.category && (
                    <p className="text-[11px] text-ink-mute mt-0.5 italic">
                      "{item.note}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <span className="text-ink-mute text-[11px]">Nghỉ ngơi (chưa tập)</span>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-xl border border-hairline shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-sm">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink">Sức Khoẻ & Tập Luyện Thể Thao</h2>
            <p className="text-xs text-ink-mute">
              Theo dõi thời lượng tập gym, bơi lội, chạy bộ và giữ vững thói quen mỗi tuần
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Ghi buổi tập mới</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-base bg-surface p-5 border border-hairline shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-mute block mb-1">
            Tổng Thời Lượng Tuần Này
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}p
          </div>
          <p className="text-[11px] text-ink-mute mt-1">
            Mục tiêu: {fitnessTracker?.goal?.targetValue || 240} phút/tuần
          </p>
        </div>

        <div className="card-base bg-surface p-5 border border-hairline shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-mute block mb-1">
            Số Buổi Tập Trong Tuần
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
            {workoutCount} buổi
          </div>
          <p className="text-[11px] text-ink-mute mt-1">
            Duy trì đều đặn 4-5 buổi/tuần
          </p>
        </div>

        <div className="card-base bg-surface p-5 border border-hairline shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-mute block mb-1">
            Chuỗi Hoạt Động (Streak)
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-semantic-success flex items-center gap-1.5 tracking-tight">
            <Flame className="w-6 h-6 fill-semantic-success text-semantic-success" />
            <span>{currentStreak > 0 ? `${currentStreak} ngày liên tiếp` : "0 ngày"}</span>
          </div>
          <p className="text-[11px] text-ink-mute mt-1">
            {currentStreak > 0 ? "Tuyệt vời! Giữ vững phong độ" : "Bắt đầu tập hôm nay nhé"}
          </p>
        </div>
      </div>

      {/* Weekly Workout Bar Chart with Rich Tooltip */}
      <div className="card-base bg-surface p-6 border border-hairline shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-hairline">
          <div>
            <h3 className="font-bold text-base text-ink">Thời Lượng Tập Luyện Theo Ngày (Tuần Này)</h3>
            <p className="text-xs text-ink-mute">
              👉 <span className="font-semibold text-primary">Di chuột vào từng cột</span> để xem tất cả các bài tập đã ghi trong ngày
            </p>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6e6e6" />
              <XAxis dataKey="dayName" stroke="#696969" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#696969" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomFitnessTooltip />} />
              <Bar dataKey="minutes" fill="#F0A875" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Workout History Table */}
      <div className="card-base bg-surface p-6 border border-hairline shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-hairline">
          <h3 className="font-bold text-base text-ink">
            Nhật Ký Tập Luyện ({entries.length} buổi)
          </h3>
        </div>

        {entries.length === 0 ? (
          <div className="py-8 text-center text-xs text-ink-mute bg-canvas-cream/30 rounded-xl">
            Chưa có buổi tập nào được ghi lại
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-hairline text-ink-mute font-bold">
                  <th className="pb-2.5">Thời gian</th>
                  <th className="pb-2.5">Bộ môn</th>
                  <th className="pb-2.5">Thời lượng</th>
                  <th className="pb-2.5">Ghi chú</th>
                  <th className="pb-2.5 text-right">Xoá</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline/60">
                {entries.map((e) => (
                  <tr key={e.id} className="hover:bg-canvas-cream/20 transition-colors">
                    <td className="py-3 text-ink-mute font-medium">
                      {formatZonedDate(e.date, "EEEE, dd/MM/yyyy")}
                    </td>
                    <td className="py-3 font-bold text-ink">
                      <span className="px-2.5 py-0.5 rounded-pill text-[11px] font-bold bg-canvas-lavender text-primary">
                        {e.category || "Tập luyện"}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-primary">
                      {e.value} phút
                    </td>
                    <td className="py-3 text-ink-mute">
                      {e.note || "—"}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Xoá buổi tập này?")) {
                            deleteEntry(e.id);
                          }
                        }}
                        className="text-ink-mute hover:text-semantic-error p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Workout Dialog */}
      {isAddOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setIsAddOpen(false)}
        >
          <div
            className="w-full max-w-md bg-surface rounded-xl border border-hairline shadow-elevation2 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-hairline bg-canvas-cream/30">
              <h3 className="font-bold text-base text-ink">Ghi Buổi Tập Mới</h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-ink-mute hover:text-ink"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddWorkout} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Bộ môn tập luyện
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {WORKOUT_ACTIVITIES.map((act) => (
                    <button
                      key={act.name}
                      type="button"
                      onClick={() => setActivity(act.name)}
                      className={cn(
                        "p-2.5 rounded-lg border text-xs font-bold text-left transition-all flex items-center gap-2",
                        activity === act.name
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-canvas border-hairline text-ink hover:bg-canvas-cream/50"
                      )}
                    >
                      <span>{act.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">
                    Thời lượng (phút) <span className="text-semantic-error">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="5"
                    step="5"
                    value={duration}
                    onChange={(e) =>
                      setDuration(e.target.value ? parseInt(e.target.value, 10) : "")
                    }
                    className="input-base text-sm font-bold text-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">
                    Ngày tập
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input-base text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Ghi chú bài tập chi tiết
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="VD: Tập ngực + tay sau, Bơi 15 vòng..."
                  className="input-base text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-hairline">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="btn-outline-compact text-xs"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={isLogging || !duration}
                  className="btn-primary-compact text-xs"
                >
                  {isLogging ? "Đang lưu..." : "Lưu buổi tập"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
