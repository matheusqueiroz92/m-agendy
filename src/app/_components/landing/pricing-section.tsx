"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
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
    description: "Ideal para profissionais autônomos e pequenas empresas",
    features: [
      { text: "Até 50 agendamentos/mês" },
      { text: "1 profissional" },
      { text: "Dashboard básico" },
      { text: "Suporte por email" },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    monthlyPrice: 59,
    description: "Perfeito para clínicas e consultórios",
    popular: true,
    features: [
      { text: "Até 200 agendamentos/mês" },
      { text: "Até 5 profissionais" },
      { text: "Dashboard completo" },
      { text: "Lembretes SMS/Email" },
      { text: "Suporte prioritário" },
    ],
  },
  {
    id: "gold",
    name: "Gold",
    monthlyPrice: 99,
    description: "Para clínicas e empresas maiores",
    features: [
      { text: "Agendamentos ilimitados" },
      { text: "Até 20 profissionais" },
      { text: "Analytics avançados" },
      { text: "Integração com outros sistemas" },
      { text: "Suporte 24/7" },
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
  const displayPrice = isAnnual ? Math.round(price * 10) : price;
  const suffix = isAnnual ? "/ano" : "/mês";

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
    <section id="precos" className="py-12 sm:py-20 md:py-28">
      <div className="container mx-auto px-4">
        <ScrollReveal className="mb-8 text-center sm:mb-10 md:mb-14">
          <h2 className="text-foreground mb-3 text-2xl font-semibold tracking-tight sm:mb-4 sm:text-3xl md:text-4xl">
            Planos e Preços
          </h2>
          <p className="text-muted-foreground mb-6 text-base sm:mb-8 sm:text-lg md:text-xl">
            Escolha o plano ideal para o tamanho e necessidades do seu negócio.
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
              <span className="text-cta ml-1.5 text-xs">-17%</span>
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
                      <PlanFeatures features={plan.features} />
                      <PulseButton href="/auth" className="w-full">
                        Adquirir plano
                      </PulseButton>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="h-full">
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
                    <PlanFeatures features={plan.features} />
                    <Button asChild variant="outline" className="w-full h-11">
                      <Link href="/auth">Escolher plano</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlanFeatures({ features }: { features: PlanFeature[] }) {
  return (
    <div className="space-y-3">
      {features.map((feature) => (
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
