"use client";

import { Calendar, FileText, MessageCircleIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface Feature {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  screenshot: string;
  screenshotAlt: string;
  width: number;
  height: number;
}


const FEATURES: Feature[] = [
  {
    id: 1,
    title: "Agendamento Online",
    description:
      "O paciente marca a consulta sozinho, 24h por dia, sem contatar a recepcionista.",
    icon: Calendar,
    screenshot: "/images/screenshots/agendamentos.png",
    screenshotAlt: "Tela de agendamento online do M.Agendy",
    width: 1332,
    height: 630,
  },
  {
    id: 2,
    title: "Confirmação por WhatsApp",
    description:
      "Lembretes automáticos que confirmam consultas e reduzem faltas em até 40%.",
    icon: MessageCircleIcon,
    screenshot: "/images/screenshots/medicos.png",
    screenshotAlt: "Tela de confirmação automática por WhatsApp do M.Agendy",
    width: 1332,
    height: 630,
  },
  {
    id: 3,
    title: "Prontuário Eletrônico",
    description:
      "Histórico completo do paciente, seguro e acessível a qualquer momento.",
    icon: FileText,
    screenshot: "/images/screenshots/dashboard.png",
    screenshotAlt: "Tela de prontuário eletrônico do M.Agendy",
    width: 1332,
    height: 630,
  },
];

export function FeaturesTabs() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="w-full">
      {/* ── Área de preview ────────────────────────────────────────────── */}
      <div className="relative mb-4 overflow-hidden rounded-2xl border border-border/60 bg-muted/20 shadow-lg">
        {/* Stack de imagens com fade entre elas */}
        <div className="relative w-full">
          {FEATURES.map((feature, index) => (
            <div
              key={feature.id}
              className={[
                "transition-opacity duration-500",
                index === activeIndex
                  ? "relative opacity-100"
                  : "absolute inset-0 opacity-0",
              ].join(" ")}
            >
              <Image
                src={feature.screenshot}
                alt={feature.screenshotAlt}
                width={feature.width}
                height={feature.height}
                className="h-auto w-full"
                priority={index === 0}
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* Gradiente suave no fundo da imagem para fundir com os tabs */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background/60 to-transparent" />
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {FEATURES.map((feature, index) => {
          const Icon = feature.icon;
          const isActive = index === activeIndex;

          return (
            <button
              key={feature.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              onMouseEnter={() => setActiveIndex(index)}
              className={[
                "group relative flex flex-col gap-2 rounded-xl border px-5 py-4 text-left",
                "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "border-cta/30 bg-cta/5 shadow-sm"
                  : "border-border/60 bg-background hover:border-cta/20 hover:bg-muted/30",
              ].join(" ")}
            >
              {/* Ícone + Título */}
              <div className="flex items-center gap-3">
                <div
                  className={[
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
                    isActive
                      ? "bg-cta/10"
                      : "bg-muted group-hover:bg-cta/10",
                  ].join(" ")}
                >
                  <Icon
                    className={[
                      "h-5 w-5 transition-colors duration-200",
                      isActive
                        ? "text-cta"
                        : "text-muted-foreground group-hover:text-cta",
                    ].join(" ")}
                  />
                </div>
                <span
                  className={[
                    "text-sm font-semibold leading-tight transition-colors duration-200",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  ].join(" ")}
                >
                  {feature.title}
                </span>
              </div>

              {/* Descrição */}
              <p
                className={[
                  "text-xs leading-relaxed transition-colors duration-200",
                  isActive
                    ? "text-muted-foreground"
                    : "text-muted-foreground/60",
                ].join(" ")}
              >
                {feature.description}
              </p>

              {/* Barra indicadora inferior */}
              <div
                className={[
                  "absolute bottom-0 left-4 right-4 h-0.5 rounded-full transition-all duration-300",
                  isActive
                    ? "bg-cta opacity-100"
                    : "bg-transparent opacity-0",
                ].join(" ")}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}