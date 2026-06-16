"use client";

import { Contact, FileSpreadsheet, Mail, Phone, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";

import { ScrollReveal } from "./scroll-reveal";
import { CtaButton } from "@/components/ui/cta-button";
import IconWhatsapp from "@/components/ui/icons/icon-whatsapp";
import Link from "next/link";
import { Label } from "@radix-ui/react-label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import IconInstagram from "@/components/ui/icons/icon-instagram";

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    subject: "",
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
        setFormData({ name: "", email: "", message: "", subject: "" });
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
    <section id="contato" className="py-8 sm:py-12 md:py-16">
      <div className="container mx-auto px-4">
        <ScrollReveal className="mx-auto mb-8 max-w-2xl text-center sm:mb-10 md:mb-12">
          <h2 className="text-foreground mb-3 text-2xl font-semibold tracking-tight sm:mb-4 sm:text-3xl md:text-4xl">
            Ainda tem dúvidas? Fale com um especialista M.Agendy
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Nossa equipe está pronta para ajudar sua clínica a dar o próximo
            passo na gestão de agendamentos.
          </p>
        </ScrollReveal>

        <div className="mx-auto grid max-w-6xl gap-5 sm:gap-6 md:gap-8 lg:grid-cols-2 lg:gap-12">
          <ScrollReveal>
            <div className="landing-glass-card flex h-full flex-col overflow-hidden rounded-2xl">

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
                  Tem alguma dúvida antes de começar? Nossa equipe responde está pronta para tirar suas dúvidas.
                </p>

                <div className="mb-8 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-muted flex size-10 items-center justify-center rounded-lg">
                      <Mail className="text-foreground size-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-foreground text-sm font-medium">Email</p>
                      <Link
                        href="mailto:contato@magendy.com.br"
                        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                      >
                        contato@magendy.com.br
                      </Link>
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

                  <div className="flex items-center gap-4">
                    <div className="bg-muted flex size-10 items-center justify-center rounded-lg">
                      <IconInstagram width={24} height={24} />
                    </div>
                    <div>
                      <p className="text-foreground text-sm font-medium">Instagram</p>
                      <Link
                        href="https://www.instagram.com/magendy"
                        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                      >
                        @magendy
                      </Link>
                    </div>
                  </div>
                </div>

                <CtaButton
                  className="mt-auto w-full"
                  disabled={isSubmitting}
                  bgColor="cta-secondary"
                >
                  <IconWhatsapp width={24} height={24} />
                  WhatsApp
                </CtaButton>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="landing-glass-card flex h-full flex-col overflow-hidden rounded-2xl">

              <div className="flex flex-1 flex-col p-6 sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                <div className="bg-cta/10 flex size-12 items-center justify-center rounded-xl">
                    <FileSpreadsheet className="text-cta size-6" aria-hidden="true" />
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
                    <Label
                      htmlFor="contact-name"
                      className="text-foreground mb-2 block text-sm font-medium"
                    >
                      Nome
                    </Label>
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
                    <Label
                      htmlFor="contact-email"
                      className="text-foreground mb-2 block text-sm font-medium"
                    >
                      Email
                    </Label>
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
                    <Label
                      htmlFor="contact-subject"
                      className="text-foreground mb-2 block text-sm font-medium"
                    >
                      Assunto
                    </Label>
                    <Select
                      name="subject"
                      value={formData.subject}
                      onValueChange={(value) =>
                        setFormData({ ...formData, subject: value })
                      }
                    >
                      <SelectTrigger id="contact-subject" className="w-full">
                        <SelectValue placeholder="Assunto da mensagem…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="question">
                          Tenho uma dúvida sobre o produto
                        </SelectItem>
                        <SelectItem value="demo">Quero uma demonstração</SelectItem>
                        <SelectItem value="technical">
                          Estou com um problema técnico
                        </SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label
                      htmlFor="contact-message"
                      className="text-foreground mb-2 block text-sm font-medium"
                    >
                      Mensagem
                    </Label>
                    <Textarea
                      id="contact-message"
                      className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring min-h-[100px] w-full rounded-lg border px-3 py-2 text-sm transition-[color,box-shadow] focus-visible:ring-2 focus-visible:outline-none sm:min-h-[120px]"
                      placeholder="Digite sua mensagem…"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <CtaButton
                    className="mt-auto w-full"
                    disabled={isSubmitting}
                    bgColor="cta"
                  >
                    {isSubmitting ? "Enviando…" : "Enviar mensagem"}
                    <Send className="ml-2 size-5" aria-hidden="true" />
                  </CtaButton>
                </form>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
