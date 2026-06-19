"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export const PortalSignOut = () => {
  const router = useRouter();

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/auth"),
      },
    });
  };

  return (
    <Button variant="outline" size="sm" onClick={handleSignOut}>
      <LogOut className="mr-1 h-4 w-4" />
      Sair
    </Button>
  );
};
