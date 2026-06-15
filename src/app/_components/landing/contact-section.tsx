"use client";

import { Contact, FileSpreadsheet, Mail, Phone, Send } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import WhatsappIcon from "@/components/ui/whatsapp-icon";

import { PulseButton } from "./pulse-button";
import { ScrollReveal } from "./scroll-reveal";

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          "Mensagem enviada com sucesso. Entraremos em contato em breve.",
        );
        setFormData({ name: "", email: "", message: "" });
      } else {
        toast.error(data.error || "Erro ao enviar mensagem. Tente novamente.");
      }
    } catch {
      toast.error(
        "Erro ao enviar mensagem. Verifique sua conexão e tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contato" className="py-12 sm:py-20 md:py-28">
      <div className="container mx-auto px-4">
        <ScrollReveal className="mx-auto mb-8 max-w-2xl text-center sm:mb-10 md:mb-12">
          <h2 className="text-foreground mb-3 text-2xl font-semibold tracking-tight sm:mb-4 sm:text-3xl md:text-4xl">
            Fale Conosco
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Nossa equipe está pronta para ajudar sua clínica a dar o próximo
            passo na gestão de agendamentos.
          </p>
        </ScrollReveal>

        <div className="mx-auto grid max-w-6xl gap-5 sm:gap-6 md:gap-8 lg:grid-cols-2 lg:gap-12">
          <ScrollReveal>
            <div className="landing-glass-card flex h-full flex-col overflow-hidden rounded-2xl">
              <div className="relative h-48 overflow-hidden sm:h-56">
                <Image
                  src="/images/calendary.png"
                  alt="Ilustração de calendário médico"
                  fill
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
              </div>

              <div className="flex flex-1 flex-col p-6 sm:p-8">
                <div className="mb-4 flex items-center gap-3">
                  <div className="bg-cta/10 flex size-12 items-center justify-center rounded-xl">
                    <Contact className="text-cta size-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-foreground text-xl font-semibold tracking-tight">
                    Canais de atendimento
                  </h3>
                </div>

                <p className="text-muted-foreground mb-6 text-sm leading-relaxed sm:text-base">
                  Pronto para transformar a gestão do seu negócio? Fale com a
                  gente por e-mail, telefone ou WhatsApp.
                </p>

                <div className="mb-8 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-muted flex size-10 items-center justify-center rounded-lg">
                      <Mail className="text-foreground size-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-foreground text-sm font-medium">Email</p>
                      <a
                        href="mailto:contato@magendy.com.br"
                        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                      >
                        contato@magendy.com.br
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-muted flex size-10 items-center justify-center rounded-lg">
                      <Phone className="text-foreground size-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-foreground text-sm font-medium">Telefone</p>
                      <a
                        href="tel:+5577981257722"
                        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                      >
                        (77) 98125-7722
                      </a>
                    </div>
                  </div>
                </div>

                <Button asChild variant="outline" className="mt-auto w-full">
                  <Link
                    href="https://wa.me/551134567890"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <WhatsappIcon />
                    WhatsApp
                  </Link>
                </Button>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="landing-glass-card flex h-full flex-col overflow-hidden rounded-2xl">
              <div className="relative hidden h-36 overflow-hidden sm:block">
                <Image
                  src="/images/ficha.png"
                  alt="Ilustração de ficha de paciente"
                  fill
                  className="object-cover object-top opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
              </div>

              <div className="flex flex-1 flex-col p-6 sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="bg-violet-500/10 flex size-12 items-center justify-center rounded-xl">
                    <FileSpreadsheet
                      className="size-6 text-violet-500"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-foreground text-xl font-semibold tracking-tight">
                    Envie uma mensagem
                  </h3>
                </div>

                <form
                  className="flex flex-1 flex-col space-y-4"
                  onSubmit={handleSubmit}
                >
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="text-foreground mb-2 block text-sm font-medium"
                    >
                      Nome
                    </label>
                    <Input
                      id="contact-name"
                      placeholder="Seu nome completo…"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      autoComplete="name"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="text-foreground mb-2 block text-sm font-medium"
                    >
                      Email
                    </label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="seu@email.com…"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      autoComplete="email"
                      spellCheck={false}
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-message"
                      className="text-foreground mb-2 block text-sm font-medium"
                    >
                      Mensagem
                    </label>
                    <textarea
                      id="contact-message"
                      className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring min-h-[100px] w-full rounded-lg border px-3 py-2 text-sm transition-[color,box-shadow] focus-visible:ring-2 focus-visible:outline-none sm:min-h-[120px]"
                      placeholder="Digite sua mensagem…"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <PulseButton
                    type="submit"
                    className="mt-auto w-full"
                    disabled={isSubmitting}
                    pulse={!isSubmitting}
                  >
                    <Send className="mr-2 size-5" aria-hidden="true" />
                    {isSubmitting ? "Enviando…" : "Enviar mensagem"}
                  </PulseButton>
                </form>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
