import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { auth } from "@/lib/auth";

import Logo from "../../../../public/images/logo-m-agendy-com-nome.png";
import Logo2 from "../../../../public/images/logo-m-agendy-com-nome-2.png";
import ResetPasswordForm from "./_components/reset-password-form";

const ResetPasswordPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    redirect("/entrar");
  }

  return (
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

      <div className="w-full max-w-[400px]">
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
