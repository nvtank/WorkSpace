"use client";

import React, { useMemo } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { CalendarView } from "@/components/calendar/calendar-view";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export default function CalendarPage() {
  const [viewMode, setViewMode] = React.useState<"day" | "week" | "month">("week");
  const [currentDate, setCurrentDate] = React.useState(new Date());

  // Calculate date range based on view mode
  const dateRange = useMemo(() => {
    if (viewMode === "day") {
      const dateStr = format(currentDate, "yyyy-MM-dd");
      return { date: dateStr };
    } else if (viewMode === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return {
        dateFrom: format(start, "yyyy-MM-dd"),
        dateTo: format(end, "yyyy-MM-dd"),
      };
    } else {
      // month
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      return {
        dateFrom: format(start, "yyyy-MM-dd"),
        dateTo: format(end, "yyyy-MM-dd"),
      };
    }
  }, [viewMode, currentDate]);

  const {
    tasks,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    copyDay,
  } = useTasks(dateRange);

  return (
    <CalendarView
      viewMode={viewMode}
      currentDate={currentDate}
      onViewModeChange={setViewMode}
      onDateChange={setCurrentDate}
      tasks={tasks}
      isLoading={isLoading}
      onCreateTask={createTask}
      onUpdateTask={updateTask}
      onDeleteTask={deleteTask}
      onCopyDay={copyDay}
    />
  );
}
