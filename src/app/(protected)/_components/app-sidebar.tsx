"use client";

import {
  Bell,
  CalendarDays,
  FileText,
  Gem,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Stethoscope,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";

import { countUnreadNotifications } from "@/actions/count-unread-notifications";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getProfessionalLabels } from "@/core/modules/clinics/domain/clinic-type";
import { authClient } from "@/lib/auth-client";

import Logo from "../../../../public/images/logo-m-agendy-com-nome.png";
import Logo2 from "../../../../public/images/logo-m-agendy-com-nome-2.png";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Agendamentos", url: "/appointments", icon: CalendarDays },
  { title: "Médicos", url: "/doctors", icon: Stethoscope },
  { title: "Pacientes", url: "/patients", icon: UsersRound },
  { title: "Prontuários", url: "/medical-records", icon: FileText },
  { title: "Notificações", url: "/notifications", icon: Bell },
  { title: "Configurações", url: "/settings", icon: Settings },
];

export const AppSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const isPlatformAdmin = session?.user?.platformRole === "platform_admin";
  const professionalsLabel = getProfessionalLabels(
    session?.user?.clinic?.type,
  ).plural;

  const user = session?.user as
    | {
        clinic?: { id?: string };
        clinics?: { id: string; role: string }[];
      }
    | undefined;
  const clinicRole = user?.clinics?.find(
    (membership) => membership.id === user?.clinic?.id,
  )?.role;
  // Recepção (staff) não acessa dados clínicos: oculta Prontuários.
  const canAccessClinicalData =
    isPlatformAdmin || (clinicRole != null && clinicRole !== "staff");

  const { execute: refreshUnread, result: unreadResult } = useAction(
    countUnreadNotifications,
  );
  const unreadCount = unreadResult?.data?.count ?? 0;

  // Atualiza o badge ao montar, ao trocar de rota (ex.: sair de /notifications,
  // que marca tudo como lido) e a cada 60s.
  useEffect(() => {
    refreshUnread();
    const interval = setInterval(refreshUnread, 60_000);
    return () => clearInterval(interval);
  }, [pathname, refreshUnread]);

  const visibleItems = items.filter(
    (item) => item.url !== "/medical-records" || canAccessClinicalData,
  );

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth");
        },
      },
    });
  };

  const activeNavClassName = "border-l-2 border-primary bg-muted/80";

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Image
          src={Logo}
          alt="M.Agendy"
          width={140}
          height={24}
          className="block dark:hidden"
        />
        <Image
          src={Logo2}
          alt="M.Agendy"
          width={140}
          height={24}
          className="hidden dark:block"
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-widest text-muted-foreground/70">
            Navegação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => {
                const isActive = pathname === item.url;
                const title =
                  item.url === "/doctors" ? professionalsLabel : item.title;
                const showBadge =
                  item.url === "/notifications" && unreadCount > 0;

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={isActive ? activeNavClassName : undefined}
                    >
                      <Link href={item.url}>
                        <item.icon aria-hidden="true" />
                        <span>{title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {showBadge && (
                      <SidebarMenuBadge className="bg-primary text-primary-foreground">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-widest text-muted-foreground/70">
            Conta
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/subscription"}
                  className={
                    pathname === "/subscription" ? activeNavClassName : undefined
                  }
                >
                  <Link href="/subscription">
                    <Gem aria-hidden="true" />
                    <span>Assinatura</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {isPlatformAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] uppercase tracking-widest text-muted-foreground/70">
              Plataforma
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/admin"}
                    className={
                      pathname === "/admin" ? activeNavClassName : undefined
                    }
                  >
                    <Link href="/admin">
                      <ShieldCheck aria-hidden="true" />
                      <span>Administração</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut}>
              <LogOut aria-hidden="true" />
              <span>Encerrar sessão</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
