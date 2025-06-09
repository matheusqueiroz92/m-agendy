"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function useThemeDetection() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  return { isDark, mounted };
}
