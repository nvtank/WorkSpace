"use client";

import React, { useState } from "react";
import { useTrackers, useTrackerEntries } from "@/hooks/use-trackers";
import { useTasks } from "@/hooks/use-tasks";
import { DashboardGrid } from "@/components/dashboard/dashboard-grid";
import { TodayAgenda } from "@/components/dashboard/today-agenda";
import { TrackerFormDialog } from "@/components/dashboard/tracker-form-dialog";
import { TrackerLogDialog } from "@/components/dashboard/tracker-log-dialog";
import { TrackerDTO } from "@/types";
import {
  Plus,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Wallet,
  Dumbbell,
  Flame,
  TrendingUp,
} from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";
import { format } from "date-fns";

export default function DashboardPage() {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const {
    trackers,
    isLoading: isTrackersLoading,
    createTracker,
    updateTracker,
    deleteTracker,
    reorderTrackers,
  } = useTrackers();

  const {
    entries,
    isLoading: isEntriesLoading,
    logEntry,
    refetch,
  } = useTrackerEntries();

  const { tasks } = useTasks({ date: todayStr });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTracker, setEditingTracker] = useState<TrackerDTO | null>(null);
  const [loggingTracker, setLoggingTracker] = useState<TrackerDTO | null>(null);

  // Quick numbers for today
  const todayTasks = tasks;
  const completedTasksCount = todayTasks.filter((t) => t.status === "done").length;
  const totalTasksCount = todayTasks.length;
  const taskPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const todayExpenses = entries
    .filter((e) => e.date.startsWith(todayStr) && e.type !== "income")
    .reduce((sum, e) => sum + e.value, 0);

  const handleOpenLog = (tracker: TrackerDTO) => {
    setLoggingTracker(tracker);
  };

  const handleEditTracker = (tracker: TrackerDTO) => {
    setEditingTracker(tracker);
    setIsCreateOpen(true);
  };

  const handleCloseForm = () => {
    setIsCreateOpen(false);
    setEditingTracker(null);
  };

  const handleFormSubmit = async (data: Partial<TrackerDTO>) => {
    if (editingTracker) {
      await updateTracker({ id: editingTracker.id, data });
    } else {
      await createTracker(data);
    }
  };

  const handleLogSubmit = async (data: {
    trackerId: string;
    value: number;
    category?: string;
    note?: string;
    date: string;
  }) => {
    await logEntry(data);
  };

  const isLoading = isTrackersLoading || isEntriesLoading;

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner / Actions with Large Typography */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-pastel-mesh p-6 sm:p-8 rounded-2xl border border-hairline shadow-sm">
        <div>
          <span className="badge-pill mb-2">Bảng Điều Khiển</span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ink tracking-tight">
            Trung Tâm Điều Hành Cuộc Sống & Học Tập
          </h2>
          <p className="text-xs sm:text-sm text-ink-mute mt-1.5 max-w-2xl">
            Chào Tuấn Anh! Theo dõi toàn diện công việc hôm nay, thói quen sinh hoạt, tài chính và tiến độ học tập VKU.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => refetch()}
            className="btn-icon bg-canvas border border-hairline hover:bg-canvas-cream"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className="w-4 h-4 text-ink-mute" />
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingTracker(null);
              setIsCreateOpen(true);
            }}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Tracker Mới</span>
          </button>
        </div>
      </div>

      {/* 4-Column Quick Number Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Stat 1: Today's Tasks */}
        <div className="card-base bg-surface p-4 sm:p-5 border border-hairline shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-ink-mute block">
              Công Việc Hôm Nay
            </span>
            <div className="text-xl sm:text-2xl font-black text-ink tracking-tight truncate">
              {completedTasksCount}/{totalTasksCount}
            </div>
            <p className="text-[10px] sm:text-[11px] text-primary font-bold">
              {taskPercent}% hoàn thành
            </p>
          </div>
        </div>

        {/* Stat 2: Today's Expense */}
        <div className="card-base bg-surface p-4 sm:p-5 border border-hairline shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-sand/15 text-sand flex items-center justify-center flex-shrink-0">
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-ink-mute block">
              Chi Tiêu Hôm Nay
            </span>
            <div className="text-xl sm:text-2xl font-black text-primary tracking-tight truncate">
              {formatCurrencyVND(todayExpenses)}
            </div>
            <p className="text-[10px] sm:text-[11px] text-ink-mute font-semibold">
              Khoản ăn uống & sinh hoạt
            </p>
          </div>
        </div>

        {/* Stat 3: VKU Credits */}
        <div className="card-base bg-surface p-4 sm:p-5 border border-hairline shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-semantic-success/15 text-semantic-success flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-ink-mute block">
              Tích Luỹ VKU
            </span>
            <div className="text-xl sm:text-2xl font-black text-semantic-success tracking-tight truncate">
              110 / 126 TC
            </div>
            <p className="text-[10px] sm:text-[11px] text-ink-mute font-semibold">
              GPA hiện tại: 3.15 (Giỏi)
            </p>
          </div>
        </div>

        {/* Stat 4: Trackers Active */}
        <div className="card-base bg-surface p-4 sm:p-5 border border-hairline shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-peach/25 text-primary flex items-center justify-center flex-shrink-0">
            <Flame className="w-5 h-5 sm:w-6 sm:h-6 fill-peach text-peach" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-ink-mute block">
              Chỉ Số Theo Dõi
            </span>
            <div className="text-xl sm:text-2xl font-black text-ink tracking-tight truncate">
              {trackers.length} Thói quen
            </div>
            <p className="text-[10px] sm:text-[11px] text-primary font-bold">
              Duy trì đều đặn
            </p>
          </div>
        </div>
      </div>

      {/* Today's Tasks & Notes Agenda */}
      <TodayAgenda />

      {/* Trackers Header & Grid */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h3 className="font-extrabold text-xl text-ink">Thói Quen & Chỉ Số Cá Nhân</h3>
          <p className="text-xs text-ink-mute">
            Kéo thả chuột để tuỳ chỉnh thứ tự các widget trên màn hình
          </p>
        </div>
      </div>

      {/* Grid or Loading */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="card-base h-64 animate-pulse bg-canvas-cream/40 flex flex-col justify-between"
            >
              <div className="h-6 w-32 bg-hairline rounded" />
              <div className="h-28 w-full bg-hairline/60 rounded" />
              <div className="h-8 w-24 bg-hairline rounded self-end" />
            </div>
          ))}
        </div>
      ) : (
        <DashboardGrid
          trackers={trackers}
          entries={entries}
          onOpenLog={handleOpenLog}
          onEditTracker={handleEditTracker}
          onDeleteTracker={deleteTracker}
          onReorderTrackers={reorderTrackers}
          onOpenCreateTracker={() => {
            setEditingTracker(null);
            setIsCreateOpen(true);
          }}
        />
      )}

      {/* Tracker Create/Edit Dialog */}
      <TrackerFormDialog
        isOpen={isCreateOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={editingTracker}
      />

      {/* Tracker Quick Log Dialog */}
      <TrackerLogDialog
        isOpen={!!loggingTracker}
        onClose={() => setLoggingTracker(null)}
        tracker={loggingTracker}
        onSubmit={handleLogSubmit}
      />
    </div>
  );
}
