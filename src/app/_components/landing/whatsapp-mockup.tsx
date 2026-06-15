import { SendHorizontal } from "lucide-react";
import Image from "next/image";

export function WhatsAppMockup() {
    return (
      <div className="relative flex items-center justify-center">
        {/* Phone shell */}
        <div className="relative w-[min(100%,260px)] rounded-[32px] border-[5px] border-[#1a1a2e] bg-[#1a1a2e] overflow-hidden sm:w-[280px] sm:rounded-[36px] sm:border-[7px] md:w-[300px]">
  
          {/* Notch */}
          <div className="flex items-center justify-center bg-[#1a1a2e] h-6">
            <div className="w-14 h-[5px] rounded-full bg-[#2a2a3e]" />
          </div>
  
          {/* WhatsApp Header */}
          <div className="flex items-center gap-2.5 bg-[#075e54] px-3 py-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#128c7e] text-lg">
              <Image
                src="/images/logo-m-agendy.png"
                alt="M.Agendy Logo"
                width={24}
                height={24}
              />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-white leading-tight">
                M.Agendy
              </p>
              <p className="text-[10px] text-[#a8d5af] leading-tight">
                Confirmação automática de consultas
              </p>
            </div>
          </div>
  
          {/* Chat body */}
          <div
            className="flex flex-col gap-2 px-2.5 py-3 min-h-[280px] sm:min-h-[340px] md:min-h-[370px]"
            style={{ background: "#e5ddd5" }}
          >
            {/* Bot message 1 */}
            <ChatBubble side="left">
              <p className="text-[11.5px] text-[#303030] leading-relaxed">
                👋 Olá, <strong>Maria Silva</strong>! Sou o assistente da{" "}
                <strong>Clínica Dr. Carlos</strong>.
              </p>
              <Timestamp time="09:00" />
            </ChatBubble>
  
            {/* Bot message 2 */}
            <ChatBubble side="left">
              <p className="text-[11.5px] text-[#303030] leading-relaxed">
                📅 Lembrete: consulta{" "}
                <strong>amanhã, 15/06 às 14h30</strong> com{" "}
                <strong>Dr. Carlos Mendes</strong>.
              </p>
              <p className="mt-1.5 text-[11.5px] text-[#303030]">
                Confirme sua presença:
              </p>
              <p className="mt-1 text-[11px] font-semibold text-[#128c7e]">
                1️⃣ Confirmar &nbsp; 2️⃣ Cancelar &nbsp; 3️⃣ Remarcar
              </p>
              <Timestamp time="09:00" />
            </ChatBubble>
  
            {/* Patient reply */}
            <ChatBubble side="right">
              <p className="text-[11.5px] text-[#303030]">1</p>
              <Timestamp time="09:02" align="right" />
            </ChatBubble>
  
            {/* Bot confirmation */}
            <ChatBubble side="left">
              <p className="text-[11.5px] text-[#303030] leading-relaxed">
                ✅ <strong>Consulta confirmada!</strong> Obrigado, Maria.
                Até amanhã às 14h30 😊
              </p>
              <p className="mt-1 text-[10.5px] text-[#555]">
                📍 Rua das Flores, 245 — Sala 3
              </p>
              <Timestamp time="09:02" />
            </ChatBubble>
  
            {/* Floating metric card */}
            <div className="mx-1 mt-1 flex items-center gap-2.5 rounded-2xl bg-white px-3 py-2.5 shadow-md">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100 text-lg">
                📉
              </div>
              <div>
                <p className="text-[12px] font-bold text-[#1a237e] leading-tight">
                  ↓ 40% menos faltas
                </p>
                <p className="text-[10px] text-gray-400 leading-tight">
                  comparado ao mês anterior
                </p>
              </div>
            </div>
          </div>
  
          {/* Input bar */}
          <div className="flex items-center gap-2 bg-[#f0f2f5] px-2.5 py-2">
            <div className="flex-1 rounded-full bg-white px-3 py-1.5 text-[11px] text-gray-400">
              Mensagem
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#25d366] text-sm">
              <SendHorizontal className="size-4" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  /* ── Sub-components ───────────────────────────────────────── */
  
  function ChatBubble({
    side,
    children,
  }: {
    side: "left" | "right";
    children: React.ReactNode;
  }) {
    return (
      <div className={`flex ${side === "right" ? "justify-end" : "justify-start"}`}>
        <div
          className={`max-w-[85%] px-3 py-2 shadow-sm ${
            side === "left"
              ? "rounded-tl-none rounded-tr-2xl rounded-b-2xl bg-white"
              : "rounded-tr-none rounded-tl-2xl rounded-b-2xl bg-[#dcf8c6]"
          }`}
        >
          {children}
        </div>
      </div>
    );
  }
  
  function Timestamp({
    time,
    align = "left",
  }: {
    time: string;
    align?: "left" | "right";
  }) {
    return (
      <p
        className={`mt-1 text-[10px] text-gray-400 ${
          align === "right" ? "text-right" : "text-right"
        }`}
      >
        {time} ✓✓
      </p>
    );
  }