"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Phone, RefreshCcw, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

import { PulseButton } from "./pulse-button";
import { ScrollReveal } from "./scroll-reveal";

interface PlanFeature {
  text: string;
}

interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "essential",
    name: "Essential",
    monthlyPrice: 39,
    description: "Para profissionais de saúde que querem parar de perder tempo com agenda.",
    features: [
      { text: "Até 50 agendamentos/mês" },
      { text: "1 profissional" },
      { text: "Agendamento online para pacientes" },
      { text: "Visualize sua agenda do dia" },
      { text: "Suporte por email" },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    monthlyPrice: 59,
    description: "Para clínicas e consultórios com mais de um profissional que precisam de agenda organizada e zero faltas.",
    popular: true,
    features: [
      { text: "Até 200 agendamentos/mês" },
      { text: "Até 5 profissionais" },
      { text: "Agenda completa + relatórios" },
      { text: "Lembretes que reduzem até 40% das faltas" },
      { text: "Suporte prioritário" },
    ],
  },
  {
    id: "gold",
    name: "Gold",
    monthlyPrice: 99,
    description: "Para redes de saúde e clínicas com múltiplos profissionais que precisam de controle total.",
    features: [
      { text: "Agendamentos ilimitados" },
      { text: "Até 20 profissionais" },
      { text: "Relatórios de ocupação e receita" },
      { text: "Conecta com seu sistema atual" },
      { text: "Suporte 24/7" },
      { text: "Sistema sob demanda" },
    ],
  },
];

function AnimatedPrice({
  price,
  isAnnual,
}: {
  price: number;
  isAnnual: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const displayPrice = isAnnual ? Math.round((price * 9) / 12) : price;
  const suffix = "/mês";

  if (reducedMotion) {
    return (
      <div className="text-foreground text-3xl font-bold tabular-nums sm:text-4xl">
        R$ {displayPrice}
        <span className="text-muted-foreground text-base font-normal sm:text-lg">
          {suffix}
        </span>
      </div>
    );
  }

  return (
    <div className="relative h-12 overflow-hidden sm:h-14">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${displayPrice}-${suffix}`}
          initial={{ opacity: 0, rotateX: -90, y: 10 }}
          animate={{ opacity: 1, rotateX: 0, y: 0 }}
          exit={{ opacity: 0, rotateX: 90, y: -10 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="text-foreground text-3xl font-bold tabular-nums sm:text-4xl"
          style={{ transformOrigin: "center bottom", willChange: "transform, opacity" }}
        >
          R$ {displayPrice}
          <span className="text-muted-foreground text-base font-normal sm:text-lg">
            {suffix}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="precos" className="py-8 sm:py-12 md:py-16">
      <div className="container mx-auto px-4">
        <ScrollReveal className="mb-8 text-center sm:mb-10 md:mb-14">
          <h2 className="text-foreground mb-3 text-2xl font-semibold tracking-tight sm:mb-4 sm:text-3xl md:text-4xl">
            Invista menos do que custa uma falta
          </h2>
          <p className="text-muted-foreground mb-6 text-base sm:mb-8 sm:text-lg md:text-xl">
            Sem contrato de fidelidade. Cancele quando quiser.
          </p>

          <div className="bg-muted/60 inline-flex items-center gap-1 rounded-xl border border-border p-1">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={cn(
                "rounded-lg px-5 py-2 text-sm font-medium transition-[color,background-color] duration-200",
                !isAnnual
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Mensal
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={cn(
                "rounded-lg px-5 py-2 text-sm font-medium transition-[color,background-color] duration-200",
                isAnnual
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Anual
              <Badge className="bg-[var(--cta-secondary)] ml-1.5 text-sm text-cta-foreground">-17%</Badge>
            </button>
          </div>
        </ScrollReveal>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {PLANS.map((plan, index) => (
            <ScrollReveal key={plan.id} delay={index * 0.1}>
              {plan.popular ? (
                <div className="landing-glow-border relative rounded-2xl p-[1px]">
                  <Badge className="bg-cta absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                    Mais Popular
                  </Badge>
                  <Card className="relative h-full rounded-2xl border-0 bg-card shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-xl sm:text-2xl">
                        {plan.name}
                      </CardTitle>
                      <AnimatedPrice
                        price={plan.monthlyPrice}
                        isAnnual={isAnnual}
                      />
                      <p className="text-muted-foreground text-sm sm:text-base">
                        {plan.description}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <PlanFeatures planId={plan.id} features={plan.features} />
                      <PulseButton href="/auth" className="w-full">
                        Começar grátis por 14 dias
                      </PulseButton>
                    </CardContent>
                  </Card>
                </div>
              ) : 
              plan.id === "gold" ? (
                <div className="relative rounded-2xl p-[1px]">
                  <Badge className="bg-yellow-400 absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                    Para grandes clínicas
                  </Badge>
                  <Card className="relative h-full rounded-2xl border border-yellow-400 bg-card shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-xl sm:text-2xl">
                        {plan.name}
                      </CardTitle>
                      <AnimatedPrice
                        price={plan.monthlyPrice}
                        isAnnual={isAnnual}
                      />
                      <p className="text-muted-foreground text-sm sm:text-base">
                        {plan.description}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <PlanFeatures planId={plan.id} features={plan.features} />
                      <Button asChild className="w-full h-11 bg-yellow-400 hover:bg-yellow-650">
                        <Link href="/auth">
                          Falar com consultor
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="relative h-full rounded-2xl border bg-card shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl">
                      {plan.name}
                    </CardTitle>
                    <AnimatedPrice
                      price={plan.monthlyPrice}
                      isAnnual={isAnnual}
                    />
                    <p className="text-muted-foreground text-sm sm:text-base">
                      {plan.description}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <PlanFeatures planId={plan.id} features={plan.features} />
                    <Button asChild variant="outline" className="w-full h-11">
                      <Link href="/auth">Começar grátis por 7 dias</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </ScrollReveal>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 px-4 py-8 text-sm text-muted-foreground">
        <span className="flex items-center gap-2"><Check className="size-5 shrink-0" aria-hidden="true" /> Teste grátis, sem cartão</span>
        <span className="flex items-center gap-2"><RefreshCcw className="size-5 shrink-0" aria-hidden="true" /> Cancele quando quiser</span>
        <span className="flex items-center gap-2"><Phone className="size-5 shrink-0" aria-hidden="true" /> Suporte incluso em todos os planos</span>
        <span className="flex items-center gap-2"><ShieldCheck className="size-5 shrink-0" aria-hidden="true" /> Dados protegidos pela LGPD</span>
      </div>
    </section>
  );
}

function PlanFeatures({ planId, features }: { planId: string, features: PlanFeature[] }) {
  return (
    <div className="space-y-3">
      {features.map((feature) => planId === "gold" ? (
        <div key={feature.text} className="flex items-center gap-3">
          <Check
            className="text-yellow-400 size-5 shrink-0"
            aria-hidden="true"
          />
          <span className="text-foreground text-sm sm:text-base">
            {feature.text}
          </span>
        </div>
      ) : (
        <div key={feature.text} className="flex items-center gap-3">
          <Check
            className="text-cta size-5 shrink-0"
            aria-hidden="true"
          />
          <span className="text-foreground text-sm sm:text-base">
            {feature.text}
          </span>
        </div>
      ))}
    </div>
  );
}
