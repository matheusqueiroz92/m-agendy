"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const AppHeader = () => {
  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur">
      <div className="flex h-20 items-center justify-between px-4">
        <SidebarTrigger />
        <ThemeToggle />
      </div>
    </header>
  );
};
