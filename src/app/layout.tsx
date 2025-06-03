import "./globals.css";

import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/query-provider";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "M.Agendy",
  description: "Transformando tempo em oportunidade.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${manrope.className} antialiased`}>
        <QueryProvider>
          <NuqsAdapter>{children}</NuqsAdapter>
          <Toaster richColors theme="light" />
        </QueryProvider>
      </body>
    </html>
  );
}
