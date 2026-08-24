"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Wallet,
  Dumbbell,
  FileText,
  BookMarked,
  GraduationCap,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLayoutStore } from "@/hooks/use-layout-store";
import { useUser } from "@/hooks/use-user";
import { signOut } from "next-auth/react";

export const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: "Lịch & Task",
    href: "/calendar",
    icon: CalendarDays,
    badge: null,
  },
  {
    name: "Nhật ký",
    href: "/journal",
    icon: BookMarked,
    badge: null,
  },
  {
    name: "Tài chính & Thu chi",
    href: "/finance",
    icon: Wallet,
    badge: "Mới",
  },
  {
    name: "Thể dục & Sức khoẻ",
    href: "/fitness",
    icon: Dumbbell,
    badge: null,
  },
  {
    name: "GPA & Học tập",
    href: "/gpa",
    icon: GraduationCap,
    badge: "VKU",
  },
  {
    name: "Ghi chú",
    href: "/notes",
    icon: FileText,
    badge: null,
  },
  {
    name: "Cài đặt",
    href: "/settings",
    icon: Settings,
    badge: null,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const {
    isSidebarCollapsed,
    toggleSidebar,
    isMobileSidebarOpen,
    setMobileSidebarOpen,
  } = useLayoutStore();

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      {/* 1. Desktop Sidebar (≥ 768px) with Collapse Mode */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-hairline bg-canvas min-h-screen fixed left-0 top-0 bottom-0 z-30 transition-all duration-300 ease-in-out select-none",
          isSidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Brand Header */}
        <div
          className={cn(
            "h-16 flex items-center border-b border-hairline px-4 transition-all duration-300",
            isSidebarCollapsed ? "justify-center" : "justify-between px-6"
          )}
        >
          <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-extrabold text-sm tracking-tight text-ink">
                  Life & Study Hub
                </span>
                <span className="text-[10px] font-bold text-primary truncate">
                  {user?.name || "User"}
                </span>
              </div>
            )}
          </Link>

          {/* Toggle Collapse Button */}
          {!isSidebarCollapsed && (
            <button
              type="button"
              onClick={toggleSidebar}
              className="w-7 h-7 rounded-lg hover:bg-canvas-cream flex items-center justify-center text-ink-mute hover:text-ink transition-colors"
              title="Thu gọn thanh điều hướng"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* If Collapsed, show Expand Button at Top */}
        {isSidebarCollapsed && (
          <div className="p-2 flex justify-center border-b border-hairline/60">
            <button
              type="button"
              onClick={toggleSidebar}
              className="w-8 h-8 rounded-lg hover:bg-canvas-cream flex items-center justify-center text-ink-mute hover:text-primary transition-colors"
              title="Mở rộng thanh điều hướng"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-xl font-bold transition-all relative group",
                  isSidebarCollapsed
                    ? "justify-center p-3"
                    : "gap-3.5 px-3.5 py-2.5 text-xs sm:text-sm",
                  isActive
                    ? "bg-canvas-lavender text-primary"
                    : "text-ink-mute hover:text-ink hover:bg-canvas-cream/60"
                )}
                title={isSidebarCollapsed ? item.name : undefined}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110",
                    isActive ? "text-primary" : "text-ink-mute group-hover:text-primary"
                  )}
                />

                {!isSidebarCollapsed && (
                  <span className="truncate flex-1">{item.name}</span>
                )}

                {!isSidebarCollapsed && item.badge && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-pill font-extrabold uppercase",
                      isActive
                        ? "bg-primary/20 text-primary"
                        : "bg-canvas-lavender text-primary"
                    )}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Tooltip on Collapsed Mode */}
                {isSidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1 bg-ink text-white text-xs rounded-md shadow-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User profile & Logout Footer */}
        <div className="p-3 border-t border-hairline">
          <div
            className={cn(
              "flex items-center rounded-xl p-2 bg-canvas-cream/40 border border-hairline/60",
              isSidebarCollapsed ? "justify-center" : "justify-between"
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
              </div>
              {!isSidebarCollapsed && (
                <div className="truncate">
                  <p className="text-xs font-bold text-ink truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-[10px] text-ink-mute truncate">
                    {user?.email || "user@lifehub.local"}
                  </p>
                </div>
              )}
            </div>

            {!isSidebarCollapsed && (
              <button
                type="button"
                onClick={handleSignOut}
                className="text-ink-mute hover:text-semantic-error p-1 transition-colors"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* 2. Mobile Drawer Navigation (< 768px) */}
      {isMobileSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div
            className="w-72 bg-canvas min-h-screen max-w-[85vw] flex flex-col border-r border-hairline shadow-2xl p-4 animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-hairline">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-ink">Life & Study Hub</h3>
                  <p className="text-[11px] text-ink-mute">{user?.name || "User"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="w-8 h-8 rounded-full bg-canvas-cream flex items-center justify-center text-ink-mute hover:text-ink"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav list */}
            <nav className="flex-1 py-4 space-y-1.5 overflow-y-auto">
              {navigationItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-sm transition-all",
                      isActive
                        ? "bg-canvas-lavender text-primary"
                        : "text-ink-mute hover:text-ink hover:bg-canvas-cream/60"
                    )}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate flex-1">{item.name}</span>
                    {item.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded-pill bg-primary/20 text-primary font-extrabold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="pt-4 border-t border-hairline flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
                  A
                </div>
                <div className="truncate text-xs">
                  <p className="font-bold text-ink truncate">{user?.name || "User"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="btn-outline-compact text-xs text-semantic-error border-semantic-error/30"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Mobile Bottom Navigation Bar (< 768px for easy thumb reach) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-hairline py-2 px-3 flex items-center justify-around shadow-lg">
        {navigationItems.slice(0, 5).map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all",
                isActive ? "text-primary font-extrabold" : "text-ink-mute hover:text-ink font-semibold"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
              <span className="text-[10px] tracking-tight">{item.name.split(" ")[0]}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
