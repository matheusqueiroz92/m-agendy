import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";

import Logo from "../../../../public/images/logo-m-agendy-com-nome.png";
import Logo2 from "../../../../public/images/logo-m-agendy-com-nome-2.png";
import SignInForm from "../_components/sign-in-form";
import Link from "next/link";

const SignInPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    redirect("/entrar");
  }

  return (
    <div className="bg-blue-500 relative flex min-h-dvh w-full flex-col items-center justify-center overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
      <Card className="border-border w-full max-w-[400px] border p-4 shadow-lg sm:p-8">
        <div className="mb-2 flex flex-col items-center justify-center">
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
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Bem-vindo de volta!</CardTitle>
          <CardDescription className="text-center">
            Não tem uma conta? <br />
            <Link href="/auth/sign-up" className="text-blue-500 text-sm hover:underline">
              Cadastre-se gratuitamente agora!
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignInForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInPage;
