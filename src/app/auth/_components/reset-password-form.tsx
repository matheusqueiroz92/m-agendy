"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .trim()
      .min(8, { message: "A senha deve conter pelo menos 8 caracteres" }),
    confirmPassword: z
      .string()
      .trim()
      .min(1, { message: "A confirmação de senha é obrigatória" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isTokenValid, setIsTokenValid] = useState(true);

  const token = searchParams.get("token");
  const error = searchParams.get("error");

  useEffect(() => {
    if (error === "INVALID_TOKEN" || !token) {
      setIsTokenValid(false);
    }
  }, [error, token]);

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof resetPasswordSchema>) => {
    if (!token) {
      toast.error("Link inválido ou expirado.");
      return;
    }

    await authClient.resetPassword(
      {
        newPassword: data.password,
        token,
      },
      {
        onSuccess: () => {
          toast.success("Senha redefinida com sucesso!");
          router.push("/auth/sign-in");
        },
        onError: () => {
          toast.error("Não foi possível redefinir a senha. O link pode ter expirado.");
        },
      },
    );
  };

  if (!isTokenValid) {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            Link inválido ou expirado
          </h2>
          <p className="text-muted-foreground text-sm">
            O link de redefinição de senha não é válido ou já expirou. Solicite
            um novo link.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button className="w-full cursor-pointer bg-blue-500 hover:bg-blue-600" asChild>
            <Link href="/auth/forgot-password">Solicitar novo link</Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/auth/sign-in">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao login
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nova senha</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Mínimo de 8 caracteres"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar nova senha</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Repita a nova senha"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col gap-3">
          <Button
            type="submit"
            className="w-full cursor-pointer bg-blue-500 hover:bg-blue-600"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Redefinir senha"
            )}
          </Button>
          <Button type="button" variant="outline" className="w-full cursor-pointer" asChild>
            <Link href="/auth/sign-in">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao login
            </Link>
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ResetPasswordForm;
