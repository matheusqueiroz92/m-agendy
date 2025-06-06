import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth";

import Logo from "../../../public/images/logo-m-agendy-com-nome.png";
import Logo2 from "../../../public/images/logo-m-agendy-com-nome-2.png";
import LoginForm from "./_components/login-form";
import RegisterForm from "./_components/register-form";

const AuthenticationPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      {/* Coluna da esquerda */}
      <div className="flex h-screen w-[50vw] flex-col items-center justify-center gap-12 bg-[url('/images/login-image.png')] bg-cover bg-left">
        <div className="mt-128 flex flex-col items-center justify-end rounded-lg bg-white/20 px-12 py-6 backdrop-blur-sm">
          <h1 className="text-center text-2xl font-bold text-white">
            Faça login ou crie uma conta para acessar o sistema.
          </h1>
        </div>
      </div>

      {/* Coluna da direita */}
      <div className="flex h-[50vh] w-[50vw] flex-col items-center justify-center gap-12">
        <div className="fixed top-8 right-8 z-50">
          <ThemeToggle />
        </div>
        <div className="flex flex-col items-center justify-center">
          {/* Exibe a logo de acordo com o tema selecionado */}
          <Image
            src={
              typeof window !== "undefined" &&
              window.matchMedia("(prefers-color-scheme: dark)").matches
                ? Logo2
                : Logo
            }
            alt="logo-m-agendy"
            width={200}
            height={200}
            className="block dark:hidden"
          />
          <Image
            src={Logo2}
            alt="logo-m-agendy"
            width={200}
            height={200}
            className="hidden dark:block"
          />
        </div>
        <Tabs defaultValue="login" className="w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Criar conta</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          <TabsContent value="register">
            <RegisterForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthenticationPage;
