"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TrackerDTO, TrackerEntryDTO } from "@/types";
import { TrackerWidget } from "./tracker-widget";
import { Plus, Sparkles } from "lucide-react";

interface SortableItemProps {
  tracker: TrackerDTO;
  entries: TrackerEntryDTO[];
  onOpenLog: (tracker: TrackerDTO) => void;
  onEditTracker: (tracker: TrackerDTO) => void;
  onDeleteTracker: (trackerId: string) => void;
}

function SortableTrackerCard({
  tracker,
  entries,
  onOpenLog,
  onEditTracker,
  onDeleteTracker,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tracker.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? "shadow-elevation2 rounded-xl" : ""}
    >
      <TrackerWidget
        tracker={tracker}
        entries={entries}
        onOpenLog={onOpenLog}
        onEditTracker={onEditTracker}
        onDeleteTracker={onDeleteTracker}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

interface DashboardGridProps {
  trackers: TrackerDTO[];
  entries: TrackerEntryDTO[];
  onOpenLog: (tracker: TrackerDTO) => void;
  onEditTracker: (tracker: TrackerDTO) => void;
  onDeleteTracker: (trackerId: string) => void;
  onReorderTrackers: (orders: Array<{ id: string; order: number }>) => void;
  onOpenCreateTracker: () => void;
}

export function DashboardGrid({
  trackers,
  entries,
  onOpenLog,
  onEditTracker,
  onDeleteTracker,
  onReorderTrackers,
  onOpenCreateTracker,
}: DashboardGridProps) {
  const [items, setItems] = useState<TrackerDTO[]>([]);

  useEffect(() => {
    setItems([...trackers].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
  }, [trackers]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required before dragging starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((item) => item.id === active.id);
        const newIndex = prev.findIndex((item) => item.id === over.id);
        const reordered = arrayMove(prev, oldIndex, newIndex);

        // Update orders in DB
        const payload = reordered.map((item, index) => ({
          id: item.id,
          order: index,
        }));
        onReorderTrackers(payload);

        return reordered;
      });
    }
  };

  if (trackers.length === 0) {
    return (
      <div className="card-cream text-center py-16 px-6 max-w-lg mx-auto my-12 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-canvas-lavender text-primary mx-auto flex items-center justify-center mb-4">
          <Sparkles className="w-7 h-7" />
        </div>
        <span className="badge-pill mb-2">Bắt đầu ngay</span>
        <h3 className="text-xl font-bold text-ink mt-1">Chưa có Tracker nào</h3>
        <p className="text-sm text-ink-mute mt-2 mb-6 leading-relaxed">
          Tạo các chỉ số bạn muốn theo dõi hàng ngày: Thể thao, Chi tiêu, Đọc sách,
          hoặc bất kỳ thói quen cá nhân nào.
        </p>
        <button
          type="button"
          onClick={onOpenCreateTracker}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Tạo Tracker đầu tiên</span>
        </button>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map((tracker) => (
            <SortableTrackerCard
              key={tracker.id}
              tracker={tracker}
              entries={entries}
              onOpenLog={onOpenLog}
              onEditTracker={onEditTracker}
              onDeleteTracker={onDeleteTracker}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
