"use client";

import { CheckCircle, MailPlus, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Componente interno que usa useSearchParams
export const VerifyEmailContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    // Se há um token na URL, o usuário clicou no link de verificação.
    // Navegação de página inteira (não fetch) para o endpoint do BetterAuth:
    // ele valida o token, cria a sessão (cookie via resposta HTTP real) e
    // redireciona de verdade — é o próprio BetterAuth que sabe fazer os três
    // passos de forma atômica. `callbackURL` fixo em "/entrar" (o roteador
    // pós-login que manda para o dashboard certo) porque o link do e-mail
    // sempre chega com "callbackURL" apontando para "/" (a home), já que
    // nenhum dos disparos de e-mail de verificação do app informa um
    // callback próprio.
    if (!token) return;
    setIsVerifying(true);
    window.location.href = `/api/auth/verify-email?token=${encodeURIComponent(token)}&callbackURL=${encodeURIComponent("/entrar")}`;
  }, [token]);

  const handleBackToLogin = () => {
    router.push("/auth");
  };

  // Se está verificando o token
  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-4 text-center text-gray-600">
              Verificando seu e-mail...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-12 bg-gray-50">
      <Image
        src="/images/logo-m-agendy-com-nome.png"
        alt="Logo M.Agendy"
        width={300}
        height={300}
        className="h-auto"
      />
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <MailPlus className="text-primary h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Verifique seu e-mail
          </CardTitle>
          <CardDescription>
            Enviamos um link de verificação para seu e-mail cadastrado. Clique
            no link para ativar sua conta.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Próximos passos:</p>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  <li>Verifique sua caixa de entrada</li>
                  <li>Procure por e-mails na lixeira ou caixa de spam </li>
                  <li>Clique no link &quot;Verificar E-mail&quot;</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-muted-foreground text-center text-sm">
            <p>Não recebeu o e-mail?</p>
            <p>
              Entre em contato com o suporte{" "}
              <a className="text-primary" href="mailto:suporte@m.agendy.com.br">
                clicando aqui
              </a>
              .
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <Button
            onClick={handleBackToLogin}
            variant="default"
            className="w-full"
          >
            Voltar ao login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
