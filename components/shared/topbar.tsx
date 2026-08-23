"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  Search,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Calendar,
  Sparkles,
} from "lucide-react";
import { formatZonedDate } from "@/lib/utils";
import { useUser } from "@/hooks/use-user";
import { useLayoutStore } from "@/hooks/use-layout-store";
import { cn } from "@/lib/utils";

const pageTitles: Record<string, { title: string; subtitle: string; tag: string }> = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Tổng quan điều hành cá nhân, thói quen & công việc hôm nay",
    tag: "Tổng quan",
  },
  "/calendar": {
    title: "Lịch Biểu & Công Việc",
    subtitle: "Lập lịch theo khung giờ, quản lý task & nhân bản ngày làm việc",
    tag: "Lịch trình",
  },
  "/finance": {
    title: "Tài Chính & Thu Chi",
    subtitle: "Ghi chép cụ thể từng bữa ăn, thu nhập làm thêm & cân đối số dư",
    tag: "Tài chính",
  },
  "/fitness": {
    title: "Sức Khoẻ & Thể Dục",
    subtitle: "Theo dõi thời lượng gym, bơi lội, chạy bộ & chuỗi ngày tập liên tiếp",
    tag: "Sức khoẻ",
  },
  "/gpa": {
    title: "GPA & Kế Hoạch Tốt Nghiệp",
    subtitle: "Theo dõi 7 học kỳ VKU, tính toán điểm sàn & mục tiêu ra trường 3.5",
    tag: "VKU 126 TC",
  },
  "/notes": {
    title: "Ghi Chú & Ý Tưởng",
    subtitle: "Dòng thời gian suy nghĩ, soạn thảo văn bản phong phú & đính kèm ảnh",
    tag: "Ghi chú",
  },
  "/settings": {
    title: "Cài Đặt Hệ Thống",
    subtitle: "Tuỳ chỉnh bảng quy đổi thang điểm, múi giờ & giao diện",
    tag: "Cấu hình",
  },
};

export function Topbar({ onOpenSearch }: { onOpenSearch?: () => void }) {
  const pathname = usePathname();
  const { user } = useUser();
  const { isSidebarCollapsed, toggleSidebar, setMobileSidebarOpen } = useLayoutStore();
  const todayFormatted = formatZonedDate(new Date(), "EEEE, 'ngày' dd/MM/yyyy");

  const currentPage =
    Object.entries(pageTitles).find(
      ([route]) => pathname === route || pathname.startsWith(`${route}/`)
    )?.[1] || {
      title: "Life Hub",
      subtitle: "Personal Space",
      tag: "Hub",
    };

  return (
    <header className="h-20 border-b border-hairline bg-surface/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 sm:px-8 transition-all duration-300">
      {/* Left: Mobile Menu button / Desktop Collapse button + Page Title & Badge */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu drawer toggle (< 768px) */}
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="md:hidden w-9 h-9 rounded-xl bg-canvas-cream hover:bg-canvas-lavender flex items-center justify-center text-ink flex-shrink-0"
          title="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar collapse toggle (≥ 768px) */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="hidden md:flex w-8 h-8 rounded-lg hover:bg-canvas-cream items-center justify-center text-ink-mute hover:text-ink transition-colors flex-shrink-0"
          title={isSidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-primary" />
          ) : (
            <PanelLeftClose className="w-4 h-4 text-ink-mute" />
          )}
        </button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-extrabold text-ink tracking-tight truncate">
              {currentPage.title}
            </h1>
            <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-pill bg-canvas-lavender text-primary border border-primary/20 flex-shrink-0">
              {currentPage.tag}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-ink-mute truncate hidden sm:block">
            {currentPage.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Quick Search + Today Date Badge */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Quick Search ⌘K */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="h-9 px-3 rounded-pill bg-canvas-cream/60 hover:bg-canvas-cream border border-hairline flex items-center gap-2 text-xs font-semibold text-ink-mute hover:text-ink transition-colors"
          title="Tìm kiếm (⌘K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Tìm kiếm...</span>
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] bg-canvas rounded border border-hairline font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Today date pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-canvas border border-hairline text-xs font-bold text-ink">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span>{todayFormatted}</span>
        </div>
      </div>
    </header>
  );
}
