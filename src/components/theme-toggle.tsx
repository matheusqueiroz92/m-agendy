"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@teispace/next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
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

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden"
        onClick={toggleTheme}
        aria-label="Alternar tema"
      >
        {isDark ? (
          <Moon className="size-4 text-blue-400" aria-hidden="true" />
        ) : (
          <Sun className="size-4 text-yellow-500" aria-hidden="true" />
        )}
      </Button>

      <div className="bg-card hidden items-center gap-3 rounded-lg border p-2 shadow-sm md:flex">
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
    </>
  );
}
