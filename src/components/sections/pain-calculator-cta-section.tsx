"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { NumericFormat } from "react-number-format";

import { Label } from "@/components/ui/label";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { Button } from "../ui/button";
import Link from "next/link";

const MAGENDY_MONTHLY = 39;
const DEFAULT_MISSED = 4;
const DEFAULT_CONSULTATION = 150;
const MAX_MISSED = 20;

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

function AnimatedLossValue({
  value,
  reducedMotion,
  className,
}: {
  value: number;
  reducedMotion: boolean;
  className?: string;
}) {
  if (reducedMotion) {
    return <span className={className}>{formatBRL(value)}</span>;
  }

  return (
    <span className={`relative inline-flex overflow-hidden ${className ?? ""}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={value}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {formatBRL(value)}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function PainCalculatorCtaSection() {
  const reducedMotion = useReducedMotion();

  const [missedPerWeek, setMissedPerWeek] = useState(DEFAULT_MISSED);
  const [consultationPrice, setConsultationPrice] = useState(DEFAULT_CONSULTATION);

  const lostPerWeek = useMemo(
    () => missedPerWeek * consultationPrice,
    [missedPerWeek, consultationPrice],
  );
  const lostPerMonth = lostPerWeek * 4;
  const roiInFirstWeek = missedPerWeek > 0 && lostPerWeek >= MAGENDY_MONTHLY;
  const roiMultiplier = lostPerWeek > 0 ? Math.round(lostPerWeek / MAGENDY_MONTHLY) : 0;

  const scaleMax = Math.max(lostPerWeek, MAGENDY_MONTHLY, 1);
  const magendyBarWidth = (MAGENDY_MONTHLY / scaleMax) * 100;
  const lossBarWidth = (lostPerWeek / scaleMax) * 100;

  const adjustMissed = (delta: number) => {
    setMissedPerWeek((current) =>
      Math.min(MAX_MISSED, Math.max(0, current + delta)),
    );
  };

  return (
    <section
      id="calculadora-dor"
      aria-labelledby="pain-calculator-heading"
      className="landing-pain-calculator border-t py-12 md:py-16"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto grid max-w-6xl items-stretch gap-6 lg:grid-cols-12 lg:gap-8">
          <ScrollReveal className="flex flex-col text-center lg:col-span-5 lg:text-left">
            <p className="text-muted-foreground mb-2 text-xs font-medium tracking-widest uppercase">
              Calcule sua perda
            </p>
            <h2
              id="pain-calculator-heading"
              className="text-foreground mb-3 text-2xl font-semibold tracking-tight text-balance md:text-3xl"
            >
              Quantas faltas você tem por semana?
            </h2>
            <p className="text-muted-foreground mb-6 text-sm leading-relaxed md:text-base">
              Uma falta = ~R$&nbsp;150 (valor da consulta) perdidos. Com o
              M.Agendy por R$&nbsp;39/mês, o ROI acontece na primeira semana.
            </p>

            <div className="mt-auto grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border/60 bg-card p-4 text-left">
                <p className="text-muted-foreground mb-1 text-xs font-medium">
                  Sem M.Agendy
                </p>
                <p
                  className="text-foreground text-base font-semibold tabular-nums"
                  aria-live="polite"
                >
                  <AnimatedLossValue
                    value={lostPerMonth}
                    reducedMotion={reducedMotion}
                  />
                  <span className="text-muted-foreground text-sm font-normal">
                    /mês
                  </span>
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  em consultas não realizadas
                </p>
              </div>

              <div className="rounded-lg border border-border/60 bg-card p-4 text-left">
                <p className="text-muted-foreground mb-1 text-xs font-medium">
                  Com M.Agendy
                </p>
                <p className="text-foreground text-base font-semibold tabular-nums">
                  {formatBRL(MAGENDY_MONTHLY)}
                  <span className="text-muted-foreground text-sm font-normal">
                    /mês
                  </span>
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  investimento fixo e previsível
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1} className="flex lg:col-span-7">
            <div className="flex h-full w-full flex-col rounded-lg border border-border/60 bg-card p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Diminuir faltas por semana"
                  onClick={() => adjustMissed(-1)}
                  disabled={missedPerWeek <= 0}
                  className="border-border/60 text-foreground flex size-8 shrink-0 items-center justify-center rounded-md border bg-background transition-[color,border-color,opacity] duration-200 focus-visible:ring-ring focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Minus className="size-3.5" aria-hidden="true" />
                </button>

                <div className="min-w-0 flex-1 text-center">
                  <span
                    id="faltas-por-semana"
                    className="text-foreground text-2xl font-semibold tabular-nums"
                    aria-live="polite"
                  >
                    {missedPerWeek}
                  </span>
                  <p className="text-muted-foreground text-[11px]">
                    faltas/semana
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Aumentar faltas por semana"
                  onClick={() => adjustMissed(1)}
                  disabled={missedPerWeek >= MAX_MISSED}
                  className="border-border/60 text-foreground flex size-8 shrink-0 items-center justify-center rounded-md border bg-background transition-[color,border-color,opacity] duration-200 focus-visible:ring-ring focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="size-3.5" aria-hidden="true" />
                </button>
              </div>

              <input
                type="range"
                min={0}
                max={MAX_MISSED}
                step={1}
                value={missedPerWeek}
                onChange={(event) =>
                  setMissedPerWeek(Number(event.target.value))
                }
                aria-label="Ajustar faltas por semana"
                className="accent-foreground mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted"
              />

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="valor-da-consulta"
                    className="text-muted-foreground text-xs font-medium"
                  >
                    Valor da consulta
                  </Label>
                  <NumericFormat
                    id="valor-da-consulta"
                    name="valor-da-consulta"
                    value={consultationPrice}
                    onValueChange={(values) => {
                      setConsultationPrice(values.floatValue ?? 0);
                    }}
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    allowNegative={false}
                    decimalScale={0}
                    autoComplete="off"
                    spellCheck={false}
                    className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full rounded-md border px-3 text-sm font-medium tabular-nums shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <p className="text-muted-foreground text-xs font-medium">
                    Perda por semana
                  </p>
                  <p
                    className="text-foreground flex h-9 items-center text-lg font-semibold tabular-nums"
                    aria-live="polite"
                  >
                    <AnimatedLossValue
                      value={lostPerWeek}
                      reducedMotion={reducedMotion}
                    />
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2 border-t border-border/60 pt-4">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-muted-foreground">M.Agendy</span>
                  <div className="bg-muted h-1.5 min-w-0 flex-1 overflow-hidden rounded-full">
                    <div
                      className="bg-foreground/30 h-full rounded-full transition-[width] duration-300 ease-out"
                      style={{ width: `${Math.max(magendyBarWidth, 6)}%` }}
                    />
                  </div>
                  <span className="text-foreground shrink-0 font-medium tabular-nums">
                    {formatBRL(MAGENDY_MONTHLY)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-muted-foreground">Sua perda</span>
                  <div className="bg-muted h-1.5 min-w-0 flex-1 overflow-hidden rounded-full">
                    <div
                      className="bg-foreground/60 h-full rounded-full transition-[width] duration-300 ease-out"
                      style={{
                        width: `${Math.max(lossBarWidth, missedPerWeek > 0 ? 8 : 0)}%`,
                      }}
                    />
                  </div>
                  <span className="text-foreground shrink-0 font-medium tabular-nums">
                    {formatBRL(lostPerWeek)}
                  </span>
                </div>
              </div>

              <p
                className="text-muted-foreground mt-auto pt-3 text-xs leading-relaxed"
                aria-live="polite"
              >
                {missedPerWeek === 0
                  ? "Ajuste os valores para estimar seu retorno."
                  : roiInFirstWeek
                    ? `Com ${missedPerWeek} faltas/semana, você recupera ${roiMultiplier}x o investimento na primeira semana.`
                    : `Com ${missedPerWeek} faltas/semana, o M.Agendy custa menos do que uma consulta perdida.`}
                {roiInFirstWeek && (
                  <span className="text-foreground ml-1.5 font-medium">
                    ROI na 1ª semana
                  </span>
                )}
              </p>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal
          className="mt-8 flex flex-col items-center gap-2"
          delay={0.15}
        >
          <p className="text-muted-foreground text-center text-sm text-pretty">
            Pare de perder dinheiro com agenda vazia. O investimento se paga
            antes do fim do mês.
          </p>
          <Button variant="outline" className="gap-2">
            <Link href="#precos">
              Ver Planos
            </Link>
            <ArrowDown className="size-4" aria-hidden="true" />
          </Button>
        </ScrollReveal>
      </div>
    </section>
  );
}
