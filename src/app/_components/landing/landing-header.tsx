"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useThemeDetection } from "@/hooks/use-theme-detection";

import Logo from "../../../../public/images/logo-m-agendy-com-nome.png";
import Logo2 from "../../../../public/images/logo-m-agendy-com-nome-2.png";

const NAV_LINKS = [
  { href: "#recursos", label: "Recursos" },
  { href: "#precos", label: "Preços" },
  { href: "#faq", label: "FAQ" },
  { href: "#contato", label: "Contato" },
];

export function LandingHeader() {
  const { isDark, mounted } = useThemeDetection();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-background/70 sticky top-0 z-50 border-b border-border/60 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between px-4 py-3 sm:py-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          {mounted ? (
            <>
              <Image
                src={isDark ? Logo2 : Logo}
                alt="M.Agendy"
                width={180}
                height={56}
                className="block h-8 w-auto dark:hidden sm:h-10"
              />
              <Image
                src={Logo2}
                alt="M.Agendy"
                width={180}
                height={56}
                className="hidden h-8 w-auto dark:block sm:h-10"
              />
            </>
          ) : (
            <Image
              src={Logo}
              alt="M.Agendy"
              width={180}
              height={56}
              className="h-8 w-auto sm:h-10"
            />
          )}
        </Link>

        <nav className="hidden items-center gap-4 lg:gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground text-md font-normal transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          <ThemeToggle />
          <Link className="cursor-pointer" href="/auth">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer text-cta hover:text-cta/80 hidden h-10 md:inline-flex px-6 border border-cta/20 hover:border-cta/50"
          >
            Entrar
          </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="bg-background/95 border-t border-border/60 backdrop-blur-xl md:hidden">
          <nav className="container mx-auto flex flex-col gap-1 px-4 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground rounded-lg px-3 py-2.5 text-sm transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link className="cursor-pointer" href="/auth">
              <Button
              variant="outline"
              size="sm"
              className="cursor-pointer text-cta hover:text-cta/80 mt-2 w-full px-6 py-4 border border-cta/20 hover:border-cta/50"
              >
                Entrar
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
