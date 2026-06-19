"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { useThemeDetection } from "@/hooks/use-theme-detection";

import LogoFooter from "../../../../public/images/logo-m-agendy-com-nome-4.png";

const QUICK_LINKS = [
  { href: "#recursos", label: "Recursos" },
  { href: "#precos", label: "Preços" },
  { href: "#faq", label: "FAQ" },
  { href: "#contato", label: "Contato" },
];

const INFO_LINKS = [
  { href: "/blog", label: "Blog" },
  { href: "/tutorial", label: "Tutorial" },
  { href: "/support", label: "Suporte" },
];

const POLICY_LINKS = [
  { href: "/terms", label: "Termos de Uso" },
  { href: "/privacy", label: "Política de Privacidade" },
  { href: "/cookies", label: "Cookies" },
  { href: "/lgpd", label: "LGPD" },
];

export function LandingFooter() {
  const footerRef = useRef<HTMLElement>(null);
  const { mounted } = useThemeDetection();

  return (
    <motion.footer
      ref={footerRef}
      className="bg-blue-950 text-white"
    >
      <div className="container mx-auto px-4 py-10 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4">
              {mounted ? (
                <Image
                  src={LogoFooter}
                  alt="M.Agendy"
                  width={160}
                  height={48}
                  className="h-10 w-auto"
                />
              ) : (
                <span className="text-lg font-semibold">M.Agendy</span>
              )}
            </div>
            <p className="text-sm leading-relaxed text-white/70">
              Simplifique os agendamentos do seu negócio de forma eficiente e
              profissional.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-white/90">
              Links Rápidos
            </h4>
            <div className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm text-white/60 transition-colors duration-200 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-white/90">
              Mais informações
            </h4>
            <div className="space-y-2.5">
              {INFO_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm text-white/60 transition-colors duration-200 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-white/90">
              Políticas
            </h4>
            <div className="space-y-2.5">
              {POLICY_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm text-white/60 transition-colors duration-200 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-8 text-center">
          <p className="text-xs text-white/50 sm:text-sm">
            © {new Date().getFullYear()} M.Agendy. Todos os direitos
            reservados. Desenvolvido por{" "}
            <Link
              href="https://matheusqueiroz.dev.br"
              className="text-white/80 transition-colors hover:text-white"
              target="_blank"
              rel="noopener noreferrer"
            >
              Matheus Queiroz
            </Link>
            .
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
