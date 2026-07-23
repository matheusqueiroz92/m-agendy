'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import Logo from "../../../../public/images/logo-m-agendy-com-nome.png";
import { usePathname, useSearchParams } from "next/navigation";

interface CardAuthProps {
  title: React.ReactNode;
  description: {
    text: string;
    link?: {
      href: string;
      textLink: string;
    };
  };
  content: React.ReactNode;
}

export const CardAuth = ( { title, description, content }: CardAuthProps ) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isSignIn = pathname === "/auth/sign-in";
  const isResetPassword = pathname === "/auth/reset-password";
  const resetToken = searchParams.get("token");
  const resetError = searchParams.get("error");
  const isInvalidResetLink =
    isResetPassword && (resetError === "INVALID_TOKEN" || !resetToken);

  return (
    <Card className="border-border w-full max-w-[400px] border p-4 shadow-lg sm:p-8">
      <div className="mb-2 flex flex-col items-center justify-center">
        <Image src={Logo} alt="logo-m-agendy" width={200} height={200} />
      </div>
      {!isInvalidResetLink && (
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">{title}</CardTitle>
          <CardDescription className="text-center">
            {description.text} {' '}
            {isSignIn && ( <br /> )}
            {description.link && (
              <Link href={description.link.href} className="text-blue-500 hover:underline">
                {description.link.textLink}
              </Link>
            )}
          </CardDescription>
        </CardHeader>
      )}
      <CardContent>
        {content}
      </CardContent>
      <CardFooter>
          <p className="text-center text-xs text-neutral-400">
            Ao continuar, você concorda com os {" "}
            <Link href="/terms" className="text-blue-500 text-xs hover:underline">
              Termos de Uso
            </Link> e a {" "}
            <Link href="/privacy" className="text-blue-500 text-xs hover:underline">
              Política de Privacidade
            </Link>.
          </p>
        </CardFooter>
    </Card>
  );
};
