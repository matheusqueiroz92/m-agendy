"use client";

import { FeaturesTabs } from "./features-tabs";
import { ScrollReveal } from "./scroll-reveal";

export function FeaturesSection() {
  return (
    <section id="recursos" className="bg-muted/20 py-8 sm:py-12 md:py-16">
      <div className="container mx-auto px-4">
        <ScrollReveal className="mb-8 text-center sm:mb-10">
          <h2 className="text-foreground mb-3 text-2xl font-semibold tracking-tight sm:mb-4 sm:text-3xl md:text-4xl">
            Veja o M.Agendy em ação
          </h2>
          <p className="text-muted-foreground mx-auto max-w-xl text-sm sm:text-base">
            Passe o mouse sobre cada funcionalidade e veja como é simples usar
            o M.Agendy no dia a dia da sua clínica.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <FeaturesTabs />
        </ScrollReveal>
      </div>
    </section>
  );
}