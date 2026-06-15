"use client";

import { AlarmClockCheck, BellRing, CalendarCheck, Gem, Settings, ShieldCheck, UserCheck } from "lucide-react";

import { BadgeInfo } from "@/components/badge-info";

import { GlassCard } from "./glass-card";
import { PulseButton } from "./pulse-button";
import { ScrollReveal } from "./scroll-reveal";

const ABOUT_CARDS = [
  {
    title: "Agenda sempre cheia e organizada",
    description:
      "Veja todos os agendamentos do dia, da semana e do mês num só ecrã. Sem Excel, sem papel, sem confusão.",
    icon: CalendarCheck,
    iconClassName: "text-blue-500",
    iconBgClassName: "bg-blue-500/10",
  },
  {
    title: "Lembretes que eliminam as faltas",
    description:
      "Confirmações automáticas por WhatsApp, SMS e e-mail. Os pacientes confirmam com um clique — e a rececionista não precisa de ligar para ninguém.",
    icon: BellRing,
    iconClassName: "text-blue-500",
    iconBgClassName: "bg-blue-500/10",
  },
  {
    title: "Cada médico com a sua agenda",
    description:
      "Configure horários, especialidades e disponibilidades por profissional. A clínica toda funciona sincronizada, sem conflitos.",
    icon: Settings,
    iconClassName: "text-blue-500",
    iconBgClassName: "bg-blue-500/10",
  },
  {
    title: "Pacientes agendam sozinhos, 24h por dia",
    description:
      "Com o link de agendamento online, o paciente marca a consulta quando quiser — sem ligar, sem esperar, sem ocupar a receção.",
    icon: UserCheck,
    iconClassName: "text-blue-500",
    iconBgClassName: "bg-blue-500/10",
  },
];

export function AboutSection() {
  return (
    <section id="sobre" className="relative py-8 sm:py-12 md:py-16">
      <div className="landing-section-glow pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="container relative mx-auto px-4">
        <ScrollReveal className="mx-auto mb-10 max-w-3xl text-center sm:mb-16">
          <h2 className="text-foreground mb-3 text-2xl font-semibold tracking-tight text-balance sm:mb-4 sm:text-3xl md:text-4xl">
          Menos trabalho manual. Mais consultas confirmadas.
          </h2>
          <p className="text-muted-foreground mb-6 text-base sm:mb-8 sm:text-lg md:text-xl">
          O M.Agendy automatiza os lembretes, organiza a agenda e liberta
          a sua equipe das tarefas repetitivas, para que o foco fique onde
          deve estar: <strong>no paciente</strong>.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
              <BadgeInfo title="Dados protegidos - conformidade LGPD" icon={<ShieldCheck className="ml-1.5 size-4 sm:ml-2 sm:size-5" aria-hidden="true" />} />
              <BadgeInfo title="Configuração em menos de 24h" icon={<AlarmClockCheck className="ml-1.5 size-4 sm:ml-2 sm:size-5" aria-hidden="true" />} />
          </div>
        </ScrollReveal>

        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 sm:gap-6">
          {ABOUT_CARDS.map((card, index) => (
            <GlassCard key={card.title} {...card} delay={index * 0.08} />
          ))}
        </div>

        <ScrollReveal className="mt-12 flex flex-col items-center gap-4" delay={0.2}>
          <span className="text-muted-foreground text-lg">
            Mais de 200 profissionais já pararam de perder consultas. Quer ser o próximo?
          </span>
          <PulseButton href="#precos" className="gap-2">
            <Gem className="size-5" aria-hidden="true" />
            Conheça nossos planos
          </PulseButton>
        </ScrollReveal>
      </div>
    </section>
  );
}
