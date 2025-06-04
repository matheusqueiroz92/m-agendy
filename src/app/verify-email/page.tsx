"use client";

import { CheckCircle, Mail, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    const handleVerification = async () => {
      if (!token) return;

      setIsVerifying(true);
      try {
        // Fazer uma requisição para o endpoint de verificação do better-auth
        const response = await fetch(`/api/auth/verify-email?token=${token}`, {
          method: "GET",
        });

        if (response.ok) {
          toast.success("E-mail verificado com sucesso!");
          router.push("/dashboard");
        } else {
          toast.error("Link de verificação inválido ou expirado.");
        }
      } catch (error) {
        console.error("Erro na verificação:", error);
        toast.error("Erro ao verificar e-mail.");
      } finally {
        setIsVerifying(false);
      }
    };
    // Se há um token na URL, significa que o usuário clicou no link de verificação
    if (token) {
      handleVerification();
    }
  }, [token, router]);

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
            <Mail className="h-6 w-6 text-blue-600" />
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
                  <li>Procure por e-mails na pasta de spam</li>
                  <li>Clique no link &quot;Verificar E-mail&quot;</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-muted-foreground text-center text-sm">
            Não recebeu o e-mail? Entre em contato com o suporte.
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <Button
            onClick={handleBackToLogin}
            variant="outline"
            className="w-full"
          >
            Voltar ao login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
