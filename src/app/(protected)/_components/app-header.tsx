"use client";

import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { Bell, LogOut, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
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

export const AppHeader = () => {
  const router = useRouter();
  const session = authClient.useSession();

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
      <div className="flex h-14 items-center justify-between px-4">
        <SidebarTrigger aria-label="Alternar barra lateral" />

        <div className="flex items-center gap-2">
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
              <DropdownMenuItem>
                <User aria-hidden="true" className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings aria-hidden="true" className="mr-2 h-4 w-4" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut aria-hidden="true" className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notificações"
          >
            <Bell aria-hidden="true" className="h-5 w-5" />
          </Button>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
