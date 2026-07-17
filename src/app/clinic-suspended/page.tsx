import { ShieldOff } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";

import { SignOutButton } from "./_components/sign-out-button";
import { RenewSubscriptionButton } from "./_components/renew-subscription-button";

const ClinicSuspendedPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth");
  }

  const clinic = session.user.clinic as
    | { status?: string; name?: string; blockedReason?: string | null }
    | undefined;

  // Se não está bloqueada, não há por que ficar aqui.
  if (clinic?.status !== "blocked") {
    redirect("/entrar");
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md bg-muted/40">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="rounded-full border-2 border-destructive/20 p-4">
            <ShieldOff className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-xl font-semibold">Acesso suspenso</h1>
          <p className="text-muted-foreground text-sm">
            O acesso da clínica{clinic?.name ? ` “${clinic.name}”` : ""} está
            temporariamente suspenso.
            {clinic?.blockedReason ? ` Motivo: ${clinic.blockedReason}.` : ""}
          </p>
          <p className="text-muted-foreground text-sm">
            Entre em contato com o suporte para regularizar.
          </p>
          <div className="flex gap-2">
            <RenewSubscriptionButton />
            <SignOutButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicSuspendedPage;
