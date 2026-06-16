"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { ScrollReveal } from "./scroll-reveal";

const FAQ_ITEMS = [
  {
    id: "item-1",
    question: "O que é o M.Agendy?",
    answer:
      "O M.Agendy é uma plataforma online de agendamento inteligente para profissionais de saúde. Com ele, seus pacientes agendam sozinhos, o WhatsApp confirma as consultas automaticamente e você para de perder tempo com tarefas manuais."
  },
  {
    id: "item-2",
    question: "Preciso instalar algum programa para usar?",
    answer:
      "Não. O M.Agendy é 100% online e pode ser acessado de qualquer dispositivo com internet, sem necessidade de instalação. Basta ter acesso à internet.",
  },
  {
    id: "item-3",
    question: "Posso testar antes de contratar?",
    answer:
      "Sim. O plano Essential tem 7 dias grátis e o Premium tem 14 dias grátis, sem precisar cadastrar cartão de crédito. Você experimenta tudo e só paga se gostar.",
  },
  {
    id: "item-4",
    question: "É possível integrar o M.Agendy com outros sistemas?",
    answer:
     "Sim. O M.Agendy integra nativamente com o WhatsApp. Para integrações com outros sistemas específicos, entre em contato com nosso suporte — desenvolvemos sob demanda.",
  },
  {
    id: "item-5",
    question: "Meus dados estão seguros na plataforma?",
    answer:
      "Sim. Todos os dados são criptografados e a plataforma está em conformidade com a LGPD (Lei Geral de Proteção de Dados). Seus dados e os dos seus pacientes estão 100% protegidos.",
  },
  {
    id: "item-6",
    question: "Como funciona o suporte?",
    answer:
      "Nosso suporte está disponível via WhatsApp, e-mail e chat, de segunda a sábado, das 8h às 20h. Clientes do plano Gold têm acesso ao suporte prioritário 24/7.",
  },
  {
    id: "item-7",
    question: "Como faço para cancelar minha assinatura?",
    answer:
      "Você pode cancelar sua assinatura a qualquer momento diretamente pelo painel do sistema, sem burocracia e sem taxas extras.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="border-t border-border/60 py-8 sm:py-12 md:py-16">
      <div className="container mx-auto px-4">
        <ScrollReveal className="mx-auto max-w-3xl">
          <h2 className="text-foreground mb-3 text-center text-2xl font-semibold tracking-tight sm:mb-4 sm:text-3xl md:text-4xl">
            Ainda tem dúvidas?
          </h2>
          <p className="text-muted-foreground mb-6 text-center text-sm sm:mb-8 sm:text-base md:mb-10 md:text-lg">
            Tire suas dúvidas sobre o funcionamento do M.Agendy. Se não encontrar sua resposta,
            entre em contato conosco.
          </p>

          <div className="landing-glass-card rounded-2xl p-3 sm:p-6 md:p-8">
            <Accordion
              type="single"
              collapsible
              className="w-full"
              defaultValue="item-1"
            >
              {FAQ_ITEMS.map((item) => (
                <AccordionItem key={item.id} value={item.id}>
                  <AccordionTrigger className="text-base font-semibold sm:text-lg">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm text-balance sm:text-base">
                    <p>{item.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
