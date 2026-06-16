"use client";

import { ThemeProvider as NextThemesProvider } from "@teispace/next-themes";
import * as React from "react";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storage="local"
    >
      {children}
    </NextThemesProvider>
  );
}
