"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export const SignOutButton = () => {
  return <Button onClick={() => authClient.signOut()}>Sair</Button>;
};
