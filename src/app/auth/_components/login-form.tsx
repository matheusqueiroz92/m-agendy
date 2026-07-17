"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@teispace/next-themes";
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
import GithubIconBlack from "@/components/ui/github-icon-black";
import GithubIconWhite from "@/components/ui/github-icon-white";
import GoogleIcon from "@/components/ui/google-icon";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const loginSchema = z.object({
  email: z.string().email().trim().min(1, { message: "E-mail é obrigatório" }),
  password: z
    .string()
    .trim()
    .min(8, { message: "A senha deve conter pelo menos 8 caracteres" }),
});

const LoginForm = () => {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmitLogin = async (data: z.infer<typeof loginSchema>) => {
    await authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: () => {
          router.push("/entrar");
        },
        onError: () => {
          toast.error("E-mail ou senha inválidos.");
        },
      },
    );
  };

  const handleGoogleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/entrar",
    });
  };

  const handleGithubLogin = async () => {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/entrar",
    });
  };

  if (!mounted) {
    return null;
  }

  return (
    <Form {...loginForm}>
      <form
        onSubmit={loginForm.handleSubmit(handleSubmitLogin)}
        className="space-y-6"
      >
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Login</h2>
          <p className="text-muted-foreground text-sm">Acesse sua clínica.</p>
        </div>

        <div className="space-y-4">
          <FormField
            control={loginForm.control}
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
          <FormField
            control={loginForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Senha</FormLabel>
                  <Link
                    href="/auth/forgot-password"
                    className="text-primary text-sm hover:underline"
                  >
                    Esqueceu sua senha?
                  </Link>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Sua senha…"
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
            className="w-full cursor-pointer bg-blue-600 text-white hover:bg-blue-800"
            disabled={loginForm.formState.isSubmitting}
          >
            {loginForm.formState.isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Entrar"
            )}
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={handleGoogleLogin}
            className="w-full cursor-pointer"
          >
            <GoogleIcon />
            Entrar com Google
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={handleGithubLogin}
            className="w-full cursor-pointer"
          >
            {resolvedTheme === "dark" ? (
              <GithubIconWhite />
            ) : (
              <GithubIconBlack />
            )}
            Entrar com Github
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default LoginForm;
