import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";

import { AppHeader } from "./_components/app-header";
import { AppSidebar } from "./_components/app-sidebar";

const ProtectedLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth");
  }

  // Admin de plataforma usa a área própria (/platform), não o painel da clínica.
  if (
    (session.user as { platformRole?: string }).platformRole ===
    "platform_admin"
  ) {
    redirect("/platform");
  }

  // Clínica bloqueada pela plataforma: tela de suspensão.
  const clinic = session.user.clinic as { status?: string } | undefined;
  if (clinic?.status === "blocked") {
    redirect("/clinic-suspended");
  }

  // Equipe de clínica sem plano ativo (nunca assinou, trial expirado ou
  // assinatura cancelada): manda para a escolha de plano, igual ao pós-login
  // (`resolveLandingRoute`). Sem este guard, o painel ficava acessível mesmo
  // sem plano