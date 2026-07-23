import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

const PageAuthContainer = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    redirect("/dashboard");
  }
  return (
    <div className="bg-blue-500 relative flex min-h-dvh w-full flex-col items-center justify-center overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-1 text-muted text-xs hover:underline">
        <ArrowLeftIcon className="h-4 w-4" />
        Voltar ao M. Agendy
      </Link>
      {children}
    </div>
  );
};

export default PageAuthContainer;