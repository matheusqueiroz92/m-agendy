import { FileQuestion } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";

import { NotFoundBackButton } from "@/app/_components/not-found-back-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";

const NotFoundPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  const homeHref = session?.user ? "/entrar" : "/";

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md bg-muted/40">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="border-border rounded-full border-2 p-4">
            <FileQuestion className="text-muted-foreground h-8 w-8" />
          </div>
          <h1 className="text-xl font-semibold">Página não encontrada</h1>
          <p className="text-muted-foreground text-sm">
            A página que você procura não existe ou foi movida.
          </p>
          <p className="text-muted-foreground text-sm">
            Verifique o endereço ou volte para continuar navegando.
          </p>
          <div className="flex gap-2">
            <Button asChild className="cursor-pointer">
              <Link href={homeHref}>Ir para o início</Link>
            </Button>
            <NotFoundBackButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFoundPage;
