"use client";

import {
  Building2,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

const items = [
  { title: "Visão geral", url: "/platform", icon: LayoutDashboard },
  { title: "Clínicas", url: "/platform/clinics", icon: Building2 },
  {
    title: "Integração WhatsApp",
    url: "/platform/whatsapp-requests",
    icon: MessageCircle,
  },
  {
    title: "E-mails de Marketing",
    url: "/platform/marketing-emails",
    icon: Mail,
  },
];

export const PlatformSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: { onSuccess: () => router.push("/auth") },
    });
  };

  const active = "border-l-2 border-primary bg-muted/80";

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span>Plataforma</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-widest text-muted-foreground/70">
            Gestão da plataforma
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={isActive ? active : undefined}
                    >
                      <Link href={item.url}>
                        <item.icon aria-hidden="true" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
