"use client";

import { Eye, Star } from "lucide-react";
import Link from "next/link";

import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Button } from "../ui/button";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
  avatarClassName: string;
  delay: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Antes eu perdia em média 6 consultas por semana por falta de confirmação. Desde que comecei a usar o M.Agendy, minha agenda está praticamente cheia todo dia. O chatbot do WhatsApp faz todo o trabalho que minha recepcionista não conseguia dar conta.",
    name: "Dra. Camila Ferreira",
    role: "Dentista · Clínica Odonto Vida, SP",
    initials: "CF",
    avatarClassName: "bg-blue-100 text-blue-700",
    delay: 0,
  },
  {
    quote:
      "Trabalho sozinha e não tinha como ficar respondendo mensagem de paciente para confirmar horário. O M.Agendy faz isso automaticamente e ainda envia o lembrete na véspera. Agora consigo focar 100% nos meus atendimentos.",
    name: "Psi. Ana Paula Rocha",
    role: "Psicóloga · Consultório Particular, MG",
    initials: "AR",
    avatarClassName: "bg-purple-100 text-purple-700",
    delay: 0.1,
  },
  {
    quote:
      "Temos 4 fisioterapeutas na clínica e a agenda era um caos. Cada um usava uma forma diferente de marcar. Com o M.Agendy, todo mundo tem sua própria agenda online, os pacientes agendam sozinhos e a gente só atende. Simples assim.",
    name: "Dr. Ricardo Alves",
    role: "Fisioterapeuta · Clínica Movimento, RJ",
    initials: "RA",
    avatarClassName: "bg-green-100 text-green-700",
    delay: 0.2,
  },
];

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <ScrollReveal delay={testimonial.delay} className="h-full">
      <div className="text-card-foreground flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6">
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className="h-4 w-4 fill-current text-yellow-400"
              aria-hidden="true"
            />
          ))}
        </div>

        <p className="text-foreground/80 flex-1 text-sm leading-relaxed italic">
          &ldquo;{testimonial.quote}&rdquo;
        </p>

        <hr className="border-border/60" />

        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${testimonial.avatarClassName}`}
          >
            {testimonial.initials}
          </div>

          <div className="flex flex-col">
            <span className="text-foreground text-sm font-semibold">
              {testimonial.name}
            </span>
            <span className="text-muted-foreground text-xs">
              {testimonial.role}
            </span>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}

export function TestimonialsSection() {
  return (
    <section
      id="depoimentos"
      className="border-border/60 border-t bg-muted/20 py-16 md:py-24"
    >
      <div className="container mx-auto px-4">
        <ScrollReveal className="mx-auto mb-10 max-w-2xl text-center md:mb-12">
          <p className="text-muted-foreground mb-3 text-xs font-medium tracking-widest uppercase">
            O QUE DIZEM NOSSOS CLIENTES
          </p>
          <h2 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">
            Mais de 200 profissionais já confiam no M.Agendy
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-base md:text-lg">
            Veja como clínicas e consultórios de todo o Brasil estão
            transformando sua gestão de agendamentos.
          </p>
        </ScrollReveal>

        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} />
          ))}
        </div>

        <ScrollReveal className="mt-10 flex flex-col items-center gap-4" delay={0.2}>
          <p className="text-muted-foreground text-center text-sm">
            Junte-se a mais de 200 profissionais de saúde que já pararam de
            perder consultas.
          </p>

          <Link
            href="/auth"
            className="flex items-center justify-center gap-2 cursor-pointer"
          >
            <Button className="cursor-pointer h-11 w-full rounded-lg px-12 text-sm sm:h-12 sm:w-auto   sm:px-8 sm:text-base sm:has-[>svg]:px-8">
              Ver demonstração gratuita
              <Eye className="ml-2 size-5" aria-hidden="true" />
              
            </Button>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
