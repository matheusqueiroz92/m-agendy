import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth";

import logo from "../../../public/images/logo-white.png";
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
      <div className="flex h-screen w-[50vw] flex-col items-center justify-center gap-12 bg-[url('/images/login-image.jpg')] bg-cover bg-center">
        <Image src={logo} alt="logo-m-agendy" width={200} height={200} />
        <div>
          <h1 className="text-center text-2xl font-bold text-white">
            Transformando tempo em oportunidade.
          </h1>
          <p className="text-center text-lg text-white">
            Faça login para acessar o sistema.
          </p>
        </div>
      </div>

      {/* Coluna da direita */}
      <div className="flex h-[50vh] w-[50vw] flex-col items-center justify-center">
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
