"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
          router.push("/dashboard");
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
      callbackURL: "/dashboard",
    });
  };

  const handleGithubLogin = async () => {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/dashboard",
    });
  };

  // Só renderiza após montar para evitar problemas de hidratação
  if (!mounted) {
    return null;
  }

  return (
    <Card>
      <Form {...loginForm}>
        <form
          onSubmit={loginForm.handleSubmit(handleSubmitLogin)}
          className="space-y-6"
        >
          <CardHeader>
            <CardTitle className="text-center text-2xl font-black text-[var(--primary)]">
              Login
            </CardTitle>
            <CardDescription className="text-center">
              Faça login para acessar o sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={loginForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite seu e-mail" {...field} />
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
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Digite sua senha"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full rounded-full"
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
              className="w-full rounded-full"
            >
              <GoogleIcon />
              Entrar com Google
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={handleGithubLogin}
              className="w-full rounded-full"
            >
              {resolvedTheme === "dark" ? (
                <GithubIconWhite />
              ) : (
                <GithubIconBlack />
              )}
              Entrar com Github
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default LoginForm;
