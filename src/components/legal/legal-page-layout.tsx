import { LandingFooter } from "@/app/_components/landing/landing-footer";
import { LandingHeader } from "@/app/_components/landing/landing-header";

interface LegalPageLayoutProps {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}

/**
 * Casca compartilhada das páginas de conteúdo legal (Termos, Privacidade,
 * Cookies, LGPD). Reaproveita o cabeçalho/rodapé da landing para manter a
 * mesma identidade visual, evitando duplicar layout em cada página (DRY).
 */
export function LegalPageLayout({
  title,
  updatedAt,
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="bg-background min-h-screen">
      <LandingHeader />
      <main className="container mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <h1 className="text-foreground mb-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>
        <p className="text-muted-foreground mb-10 text-sm">
          Última atualização: {updatedAt}
        </p>
        <div className="text-foreground/90 space-y-6 text-sm leading-relaxed sm:text-base [&_h2]:text-foreground [&_h2]:mt-8 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
          {children}
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
