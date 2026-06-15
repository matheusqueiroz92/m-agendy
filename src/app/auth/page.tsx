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
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Coluna da esquerda */}
      <div className="bg-muted/40 border-border relative hidden flex-col items-center justify-center overflow-hidden border-r px-8 py-12 lg:flex">
        <div className="flex flex-col items-center justify-center text-center">
          <Image
            src="/images/ficha.png"
            alt="Calendário"
            width={500}
            height={400}
            className="mb-8"
          />

          <h2 className="text-foreground mb-4 text-2xl font-semibold tracking-tight">
            Transforme a gestão da sua clínica
          </h2>

          <p className="text-muted-foreground max-w-md text-lg leading-relaxed">
            Simplifique o agendamento de consultas, gerencie pacientes e otimize
            o fluxo da sua clínica com nossa plataforma completa e intuitiva.
          </p>
        </div>
      </div>

      {/* Coluna da direita */}
      <div className="bg-background relative flex min-h-screen flex-col items-center justify-center p-8">
        <div className="absolute top-8 right-8 z-50">
          <ThemeToggle />
        </div>

        <div className="mb-8 flex flex-col items-center justify-center">
          <Image
            src={Logo}
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

        <Tabs defaultValue="login" className="w-full max-w-[400px]">
          <TabsList className="bg-muted/50 mb-6 grid w-full grid-cols-2 rounded-lg p-1">
            <TabsTrigger value="login" className="rounded-md">
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="rounded-md">
              Criar conta
            </TabsTrigger>
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
