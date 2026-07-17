"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export const SignOutButton = () => {
  const router = useRouter();
  return (
    <Button
      variant="outline"
      className="cursor-pointer"
      onClick={() =>
        authClient.signOut({
          fetchOptions: { onSuccess: () => router.push("/auth") },
        })
      }
    >
      Encerrar sessão
    </Button>
  );
};
