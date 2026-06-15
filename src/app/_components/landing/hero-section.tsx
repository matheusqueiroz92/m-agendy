"use client";

import { motion } from "framer-motion";
import { Activity, Eye, Globe } from "lucide-react";
// import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { BadgeInfo } from "@/components/badge-info";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import IconWhatsapp from "@/components/ui/icons/icon-whatsapp";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useThemeDetection } from "@/hooks/use-theme-detection";

// import DashboardDarkImage from "../../../../public/images/dashboard-dark-image.png";
// import DashboardLightImage from "../../../../public/images/dashboard-light-image.png";
import { WhatsAppMockup } from "./whatsapp-mockup";

const TITLE_WORDS = [
  "Chega",
  "de",
  "agenda",
  "com",
  "buracos.",
  "Acabe",
  "com",
  "as",
  "faltas",
  "e",
  "encha",
  "o",
  "seu",
  "consultório",
  "no",
  "piloto",
  "automático.",
];

function HeroBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="landing-hero-surface absolute inset-0" />
      <div className="landing-hero-accent absolute inset-y-0 right-0 w-[45%] opacity-80" />
      <div className="landing-hero-fade absolute inset-x-0 bottom-0 h-32 sm:h-40" />
    </div>
  );
}

function GradientTitle({ reducedMotion }: { reducedMotion: boolean }) {
  if (reducedMotion) {
    return (
      <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl">
        {TITLE_WORDS.join(" ")}
      </h1>
    );
  }

  return (
    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl">
      {TITLE_WORDS.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          className="landing-gradient-text mr-[0.28em] inline-block"
          initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.5,
            delay: 0.08 * index,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {word}
        </motion.span>
      ))}
    </h1>
  );
}

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { /*_isDark*/ mounted } = useThemeDetection();


  return (
    <section
      ref={containerRef}
      className="relative flex min-h-0 items-center overflow-hidden py-8 sm:py-12 md:min-h-[calc(100dvh-4.5rem)] md:py-14 lg:-mb-16 lg:pb-20"
    >
      <HeroBackground />

      <div className="container relative z-10 mx-auto w-full px-4">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-10 lg:gap-16">
          <div className="space-y-5 sm:space-y-7 md:space-y-8">
            <div className="flex flex-wrap gap-2 sm:gap-3">
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <BadgeInfo title="Para clínicas e consultórios" icon={<Activity className="ml-1.5 size-4 sm:ml-2 sm:size-5" aria-hidden="true" />} />
            </motion.div>
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Badge
                variant="outline"
                className="border-cta/25 bg-cta/8 text-cta px-2.5 py-1 text-xs font-medium tracking-wide sm:px-3 sm:text-sm"
              >
                Sem instalação · 100% online
                <Globe className="ml-1.5 size-4 sm:ml-2 sm:size-5" aria-hidden="true" />
              </Badge>
            </motion.div>
            </div>

            <GradientTitle reducedMotion={reducedMotion} />

            <motion.p
              className="text-muted-foreground max-w-lg text-base leading-relaxed sm:text-lg md:text-xl"
              initial={reducedMotion ? false : { opacity: 0, y: 16 }}
              animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              O M.Agendy confirma consultas automaticamente pelo WhatsApp,
              deixa os pacientes agendar online e liberta a sua recepcionista
              para o que realmente importa.
            </motion.p>

            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/demo"
                className="flex items-center justify-center gap-2 cursor-pointer"
              >
                <Button className="cursor-pointer h-11 w-full rounded-lg px-6 text-sm sm:h-12 sm:w-auto sm:px-8 sm:text-base sm:has-[>svg]:px-8">
                  Ver demonstração gratuita
                  <Eye className="ml-2 size-5" aria-hidden="true" />
                  
                </Button>
              </Link>

              <Link
                href="/whatsapp"
                className="flex items-center justify-center gap-2 cursor-pointer"
              >
                <Button
                  className="cursor-pointer h-11 w-full rounded-lg px-6 text-sm sm:h-12 sm:w-auto sm:px-8 sm:text-base sm:has-[>svg]:px-8 bg-[var(--cta-secondary)] hover:bg-[var(--cta-secondary)]/80"
                >
                  Falar com consultor
                  <IconWhatsapp width={24} height={24} />
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative flex min-h-[220px] items-center justify-center sm:min-h-[300px] md:min-h-[360px] lg:min-h-[440px]">
              <div className="overflow-hidden rounded-2xl">
                {mounted ? (
                  <WhatsAppMockup />
                ) : (
                  <WhatsAppMockup />
                )}
              </div>
          </div>
        </div>
      </div>
    </section>
  );
}
