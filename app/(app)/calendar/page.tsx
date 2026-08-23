"use client";

import React from "react";
import { useTasks } from "@/hooks/use-tasks";
import { CalendarView } from "@/components/calendar/calendar-view";

export default function CalendarPage() {
  const {
    tasks,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    copyDay,
  } = useTasks();

  return (
    <CalendarView
      tasks={tasks}
      onCreateTask={createTask}
      onUpdateTask={updateTask}
      onDeleteTask={deleteTask}
      onCopyDay={copyDay}
    />
  );
}
