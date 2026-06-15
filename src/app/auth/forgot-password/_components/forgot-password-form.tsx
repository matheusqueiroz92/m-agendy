"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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

const forgotPasswordSchema = z.object({
  email: z.string().email().trim().min(1, { message: "E-mail é obrigatório" }),
});

const ForgotPasswordForm = () => {
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof forgotPasswordSchema>) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
    const redirectTo = `${appUrl}/auth/reset-password`;

    await authClient.forgetPassword(
      {
        email: data.email,
        redirectTo,
      },
      {
        onSuccess: () => {
          setEmailSent(true);
          toast.success("Se o e-mail estiver cadastrado, você receberá as instruções.");
        },
        onError: () => {
          toast.error("Não foi possível enviar o e-mail. Tente novamente.");
        },
      },
    );
  };

  if (emailSent) {
    return (
      <div className="space-y-6 text-center">
        <div className="bg-primary/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
          <Mail className="text-primary h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            Verifique seu e-mail
          </h2>
          <p className="text-muted-foreground text-sm">
            Se o e-mail estiver cadastrado, enviamos um link para redefinir sua
            senha. Verifique também a caixa de spam.
          </p>
        </div>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/auth">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao login
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Esqueceu sua senha?
          </h2>
          <p className="text-muted-foreground text-sm">
            Informe seu e-mail e enviaremos um link para redefinir sua senha.
          </p>
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input placeholder="seu@email.com…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-3">
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Enviar link de redefinição"
            )}
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/auth">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao login
            </Link>
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ForgotPasswordForm;