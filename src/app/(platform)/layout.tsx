import { redirect } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getAuthenticatedActor } from "@/core/modules/iam/infra/session-actor-provider";

import { PlatformSidebar } from "./_components/platform-sidebar";

const PlatformLayout = async ({ children }: { children: React.ReactNode }) => {
  const actor = await getAuthenticatedActor();

  if (!actor) {
    redirect("/auth");
  }
  // Área exclusiva do admin de plataforma; clínicas vão para o painel próprio.
  if (!actor.isPlatformAdmin()) {
    redirect("/dashboard");
  }

  return (
    <SidebarProvider>
      <PlatformSidebar />
      <SidebarInset>
        <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border/60 px-4 backdrop-blur">
          <SidebarTrigger aria-label="Alternar barra lateral" />
          <ThemeToggle />
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default PlatformLayout;
