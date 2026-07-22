import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";

import { Card } from "@/components/ui/card";
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
    redirect("/entrar");
  }

  return (
    <div className="bg-blue-500 relative flex min-h-dvh w-full flex-col items-center justify-center overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
      <Card className="border-border w-full max-w-[400px] border p-4 shadow-lg sm:p-8">
        <div className="mb-4 flex flex-col items-center justify-center">
          <Image
            src={Logo}
            alt="logo-m-agendy"
            width={200}
            height={200}
            className="block h-auto w-[160px] sm:w-[200px] dark:hidden"
          />
          <Image
            src={Logo2}
            alt="logo-m-agendy"
            width={200}
            height={200}
            className="hidden h-auto w-[160px] sm:w-[200px] dark:block"
          />
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="bg-muted/50 mb-4 grid w-full grid-cols-2 rounded-lg p-1 sm:mb-6">
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
      </Card>
    </div>
  );
};

export default AuthenticationPage;
