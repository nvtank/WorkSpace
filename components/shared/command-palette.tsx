"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Calendar,
  FileText,
  BookMarked,
  GraduationCap,
  Settings,
  Plus,
  X,
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      label: "Đi tới Dashboard",
      icon: LayoutDashboard,
      action: () => {
        router.push("/dashboard");
        onClose();
      },
    },
    {
      label: "Mở Lịch & Công việc",
      icon: Calendar,
      action: () => {
        router.push("/calendar");
        onClose();
      },
    },
    {
      label: "Quản lý Chi tiêu & Tài chính",
      icon: LayoutDashboard,
      action: () => {
        router.push("/finance");
        onClose();
      },
    },
    {
      label: "Sức khoẻ & Thể dục",
      icon: LayoutDashboard,
      action: () => {
        router.push("/fitness");
        onClose();
      },
    },
    {
      label: "Xem GPA & Học tập",
      icon: GraduationCap,
      action: () => {
        router.push("/gpa");
        onClose();
      },
    },
    {
      label: "Cài đặt hệ thống",
      icon: Settings,
      action: () => {
        router.push("/settings");
        onClose();
      },
    },
  ];

  const filtered = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-surface rounded-xl border border-hairline shadow-elevation2 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center px-4 py-3 border-b border-hairline gap-3 bg-canvas">
          <Search className="w-5 h-5 text-ink-mute" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Gõ lệnh hoặc tìm kiếm trang..."
            className="w-full bg-transparent text-ink placeholder:text-ink-mute text-sm focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="text-ink-mute hover:text-ink"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="max-h-72 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-6 text-center text-sm text-ink-mute">
              Không tìm thấy lệnh phù hợp
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ink hover:bg-canvas-lavender hover:text-primary text-left transition-colors"
                >
                  <Icon className="w-4 h-4 text-ink-mute" />
                  <span className="font-semibold">{item.label}</span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-canvas-cream/50 border-t border-hairline flex items-center justify-between text-[11px] text-ink-mute">
          <span>Dùng phím mũi tên hoặc click để chọn</span>
          <kbd className="px-1.5 py-0.5 bg-canvas rounded border border-hairline font-mono">
            ESC để đóng
          </kbd>
        </div>
      </div>
    </div>
  );
}
