"use client";

import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { Bell, LogOut, Settings, User } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

import { countUnreadNotifications } from "@/actions/count-unread-notifications";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

import { HeaderBreadcrumbs } from "./header-breadcrumbs";

export const AppHeader = () => {
  const router = useRouter();
  const pathname = usePathname();
  const session = authClient.useSession();

  // Mesmo padrão do badge de notificações não lidas do menu lateral
  // (app-sidebar.tsx): busca ao montar e revalida a cada 60s/troca de rota.
  const { execute: refreshUnread, result: unreadResult } = useAction(
    countUnreadNotifications,
  );
  const unreadCount = unreadResult?.data?.count ?? 0;

  useEffect(() => {
    refreshUnread();
    const interval = setInterval(refreshUnread, 60_000);
    return () => clearInterval(interval);
  }, [pathname, refreshUnread]);

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth");
        },
      },
    });
  };

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b border-border/60 backdrop-blur">
      <div className="flex h-14 items-center gap-2 px-4">
        <SidebarTrigger aria-label="Alternar barra lateral" />
        <HeaderBreadcrumbs />

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2"
                aria-label="Menu da conta"
              >
                <Avatar>
                  <AvatarImage
                    src={session?.data?.user?.image as string}
                    alt="Avatar"
                    className="h-8 w-8 rounded-xl"
                  />
                </Avatar>
                <div className="hidden text-left md:block">
                  <p className="text-sm font-medium">
                    {session?.data?.user?.clinic?.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {session?.data?.user?.email}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <User aria-hidden="true" className="mr-2 h-4 w-4" />
                  Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings aria-hidden="true" className="mr-2 h-4 w-4" />
                  Configurações
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut aria-hidden="true" className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Notificações"
          >
            <Link href="/notifications">
              <Bell aria-hidden="true" className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 min-w-4 justify-center rounded-full px-1 text-[10px] leading-none">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
            </Link>
          </Button>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
