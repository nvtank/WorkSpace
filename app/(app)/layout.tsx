"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/shared/sidebar";
import { Topbar } from "@/components/shared/topbar";
import { CommandPalette } from "@/components/shared/command-palette";
import { useLayoutStore } from "@/hooks/use-layout-store";
import { cn } from "@/lib/utils";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isSidebarCollapsed } = useLayoutStore();

  return (
    <div className="min-h-screen bg-canvas flex flex-col md:flex-row">
      {/* Sidebar Navigation (Desktop & Mobile Drawer + Mobile Bottom Bar) */}
      <Sidebar />

      {/* Main Content Area with dynamic padding matching Sidebar state */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "md:pl-20" : "md:pl-64",
          "pb-20 md:pb-8" // extra padding at bottom on mobile to avoid bottom nav bar collision
        )}
      >
        <Topbar onOpenSearch={() => setIsSearchOpen(true)} />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          {children}
        </main>
      </div>

      {/* Command Palette (⌘K) */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
}
