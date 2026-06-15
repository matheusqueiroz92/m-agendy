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
      "O M.Agendy é uma plataforma online para gestão de agendamentos, ideal para profissionais autônomos, clínicas, consultórios e estabelecimentos que necessitam organizar horários de forma eficiente.",
  },
  {
    id: "item-2",
    question: "Preciso instalar algum programa para usar?",
    answer:
      "Não. O M.Agendy é 100% online e pode ser acessado de qualquer dispositivo com internet, sem necessidade de instalação.",
  },
  {
    id: "item-3",
    question: "Posso testar antes de contratar?",
    answer:
      "Sim. Oferecemos um período de teste gratuito para que você conheça todas as funcionalidades antes de escolher o plano ideal.",
  },
  {
    id: "item-4",
    question: "É possível integrar o M.Agendy com outros sistemas?",
    answer:
      "Sim. O M.Agendy possui integrações com diversos sistemas e ferramentas. Caso precise de uma integração específica, entre em contato com nosso suporte.",
  },
  {
    id: "item-5",
    question: "Meus dados estão seguros na plataforma?",
    answer:
      "Sim. Utilizamos criptografia e seguimos as melhores práticas de segurança para garantir a proteção dos seus dados e dos seus pacientes.",
  },
  {
    id: "item-6",
    question: "Como funciona o suporte?",
    answer:
      "Nosso suporte está disponível via e-mail, WhatsApp e chat. Estamos prontos para te ajudar sempre que precisar.",
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
    <section id="faq" className="border-t border-border/60 py-12 sm:py-20 md:py-28">
      <div className="container mx-auto px-4">
        <ScrollReveal className="mx-auto max-w-3xl">
          <h2 className="text-foreground mb-3 text-center text-2xl font-semibold tracking-tight sm:mb-4 sm:text-3xl md:text-4xl">
            Perguntas Frequentes
          </h2>
          <p className="text-muted-foreground mb-6 text-center text-sm sm:mb-8 sm:text-base md:mb-10 md:text-lg">
            Tire suas dúvidas sobre o funcionamento do M.Agendy. Se não
            encontrar sua resposta, entre em contato conosco.
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
