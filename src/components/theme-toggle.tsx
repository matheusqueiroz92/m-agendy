"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Switch } from "@/components/ui/switch";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = resolvedTheme === "dark";

  const handleToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  return (
    <div className="bg-card flex items-center gap-3 rounded-full border p-2 shadow-sm">
      <Sun
        className={`h-4 w-4 transition-colors ${isDark ? "text-muted-foreground" : "text-yellow-500"}`}
      />
      <Switch
        checked={isDark}
        onCheckedChange={handleToggle}
        aria-label="Alternar tema"
      />
      <Moon
        className={`h-4 w-4 transition-colors ${isDark ? "text-blue-400" : "text-muted-foreground"}`}
      />
    </div>
  );
}
