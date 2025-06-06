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
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur">
      <div className="flex h-20 items-center justify-between px-4">
        <SidebarTrigger />

        <div className="flex items-center gap-2">
          {/* Avatar do usuário com dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
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
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Botão de notificações */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {/* Badge de notificação (opcional) */}
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"></span>
          </Button>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
