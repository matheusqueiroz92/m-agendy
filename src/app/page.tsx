"use client";

import {
  Activity,
  BarChart3,
  Bell,
  Calendar,
  Check,
  Contact,
  CreditCard,
  Eye,
  FileSpreadsheet,
  Mail,
  Phone,
  Send,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import WhatsappIcon from "@/components/ui/whatsapp-icon";

import Logo from "../../public/images/logo-m-agendy-com-nome.png";
import Logo2 from "../../public/images/logo-m-agendy-com-nome-2.png";

export default function HomePage() {
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          "Mensagem enviada com sucesso! Entraremos em contato em breve.",
        );
        setFormData({ name: "", email: "", message: "" });
      } else {
        toast.error(data.error || "Erro ao enviar mensagem. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      toast.error(
        "Erro ao enviar mensagem. Verifique sua conexão e tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="from-background to-muted/20 min-h-screen bg-gradient-to-b">
      {/* Header */}
      <header className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Image
              src={
                typeof window !== "undefined" &&
                window.matchMedia("(prefers-color-scheme: dark)").matches
                  ? Logo2
                  : Logo
              }
              alt="logo-m-agendy"
              width={210}
              height={70}
              className="block dark:hidden"
            />
            <Image
              src={Logo2}
              alt="logo-m-agendy"
              width={210}
              height={70}
              className="hidden dark:block"
            />
          </div>

          {/* Navbar */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="#beneficios"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Benefícios
            </Link>
            <Link
              href="#recursos"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Recursos
            </Link>
            <Link
              href="#precos"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Preços
            </Link>
            <Link
              href="#contato"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Contato
            </Link>
          </nav>

          {/* Theme Toggle and Login/Register Buttons */}
          <div className="flex items-center gap-6">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-foreground text-5xl leading-tight font-bold">
                Simplifique os{" "}
                <span className="text-blue-600">agendamentos</span> do{" "}
                <span className="text-blue-600">seu negócio</span> de forma
                eficiente.
              </h1>
              <p className="text-muted-foreground text-xl leading-relaxed">
                Ideal para empresas, consultórios e profissionais autônomos que
                desejam organizar e otimizar os agendamentos das consultas.
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                asChild
                className="animate-shine relative w-sm overflow-hidden rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-blue-800 px-10 py-6 text-lg font-extrabold text-white shadow-xl transition-all duration-300 ease-in-out hover:scale-105 hover:from-blue-800 hover:via-blue-700 hover:to-blue-900 hover:shadow-2xl focus:ring-4 focus:ring-blue-300"
                style={{
                  boxShadow: "0 8px 32px 0 rgba(59,130,246,0.25)",
                }}
              >
                <Link href="/auth" className="flex items-center gap-2">
                  <span className="relative z-10">Começar agora</span>
                  <svg
                    className="animate-bounce-right ml-2 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="relative rounded-full border-2 border-blue-600 bg-white/80 px-8 py-6 font-semibold text-blue-700 transition-all duration-300 ease-in-out hover:scale-105 hover:border-blue-800 hover:bg-blue-50 hover:text-blue-900 hover:shadow-lg focus:ring-2 focus:ring-blue-200"
              >
                <span className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-600 transition-transform duration-300 group-hover:rotate-6" />
                  Ver demonstração
                </span>
              </Button>
              <style jsx>{`
                .animate-shine {
                  background-size: 200% 200%;
                  animation: shine-gradient 2.5s linear infinite;
                }
                @keyframes shine-gradient {
                  0% {
                    background-position: 0% 50%;
                  }
                  50% {
                    background-position: 100% 50%;
                  }
                  100% {
                    background-position: 0% 50%;
                  }
                }
                .animate-bounce-right {
                  animation: bounce-right 1.2s infinite;
                }
                @keyframes bounce-right {
                  0%,
                  100% {
                    transform: translateX(0);
                  }
                  50% {
                    transform: translateX(6px);
                  }
                }
              `}</style>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl bg-slate-900 p-6 shadow-2xl">
              <div className="mb-4 rounded-lg bg-slate-800 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="ml-auto text-xs text-slate-400">
                    M.Agendy Dashboard
                  </span>
                </div>

                {/* Dashboard Preview */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-blue-600 p-3">
                      <h3 className="text-sm font-medium text-white">
                        Dr. Carlos Silva
                      </h3>
                      <p className="text-xs text-blue-200">14:30 - Consulta</p>
                    </div>
                    <div className="rounded-lg bg-green-600 p-3">
                      <h3 className="text-sm font-medium text-white">
                        Dra. Ana Santos
                      </h3>
                      <p className="text-xs text-green-200">15:00 - Exame</p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-700 p-4">
                    <h4 className="mb-2 text-sm font-medium text-white">
                      Próximos agendamentos
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">João Pedro</span>
                        <span className="text-slate-400">16:00</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">Maria Silva</span>
                        <span className="text-slate-400">16:30</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-700 p-4">
                    <h4 className="mb-2 text-sm font-medium text-white">
                      Estatísticas
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-8 rounded bg-yellow-500"></div>
                      <div className="h-6 rounded bg-yellow-400"></div>
                      <div className="h-10 rounded bg-yellow-500"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recursos Section */}
      <section id="recursos" className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="text-foreground mb-4 text-4xl font-bold">
              Recursos
            </h2>
            <p className="text-muted-foreground text-xl">
              Descubra como o M.Agendy pode transformar seu negócio.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="group relative overflow-hidden rounded-2xl border-none bg-gradient-to-br from-blue-50 via-white to-blue-100 shadow-xl transition-transform hover:scale-[1.03] hover:shadow-2xl dark:from-blue-950 dark:via-slate-900 dark:to-blue-900">
              <div className="absolute -top-10 -right-10 z-0 h-32 w-32 rounded-full bg-blue-200 opacity-30 blur-2xl dark:bg-blue-800"></div>
              <CardHeader className="relative z-10">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 shadow-lg transition-transform group-hover:scale-110 dark:bg-blue-900/70">
                  <Calendar className="h-7 w-7 text-blue-600 dark:text-blue-300" />
                </div>
                <CardTitle className="text-lg font-bold text-blue-700 dark:text-blue-200">
                  Agendamentos Simplificados
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground text-base">
                  Interface intuitiva que permite agendar, reagendar e cancelar
                  consultas com apenas alguns cliques.
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden rounded-2xl border-none bg-gradient-to-br from-green-50 via-white to-green-100 shadow-xl transition-transform hover:scale-[1.03] hover:shadow-2xl dark:from-green-950 dark:via-slate-900 dark:to-green-900">
              <div className="absolute -bottom-10 -left-10 z-0 h-32 w-32 rounded-full bg-green-200 opacity-30 blur-2xl dark:bg-green-800"></div>
              <CardHeader className="relative z-10">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 shadow-lg transition-transform group-hover:scale-110 dark:bg-green-900/70">
                  <Users className="h-7 w-7 text-green-600 dark:text-green-300" />
                </div>
                <CardTitle className="text-lg font-bold text-green-700 dark:text-green-200">
                  Gestão de Médicos
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground text-base">
                  Cadastre médicos, especialidades e gerencie disponibilidades
                  de forma eficiente.
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden rounded-2xl border-none bg-gradient-to-br from-purple-50 via-white to-purple-100 shadow-xl transition-transform hover:scale-[1.03] hover:shadow-2xl dark:from-purple-950 dark:via-slate-900 dark:to-purple-900">
              <div className="absolute -top-10 -left-10 z-0 h-32 w-32 rounded-full bg-purple-200 opacity-30 blur-2xl dark:bg-purple-800"></div>
              <CardHeader className="relative z-10">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-purple-100 shadow-lg transition-transform group-hover:scale-110 dark:bg-purple-900/70">
                  <Activity className="h-7 w-7 text-purple-600 dark:text-purple-300" />
                </div>
                <CardTitle className="text-lg font-bold text-purple-700 dark:text-purple-200">
                  Cadastro de Pacientes
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground text-base">
                  Mantenha um registro organizado de todos os seus pacientes e
                  histórico de consultas.
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden rounded-2xl border-none bg-gradient-to-br from-orange-50 via-white to-orange-100 shadow-xl transition-transform hover:scale-[1.03] hover:shadow-2xl dark:from-orange-950 dark:via-slate-900 dark:to-orange-900">
              <div className="absolute -right-10 -bottom-10 z-0 h-32 w-32 rounded-full bg-orange-200 opacity-30 blur-2xl dark:bg-orange-800"></div>
              <CardHeader className="relative z-10">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100 shadow-lg transition-transform group-hover:scale-110 dark:bg-orange-900/70">
                  <BarChart3 className="h-7 w-7 text-orange-600 dark:text-orange-300" />
                </div>
                <CardTitle className="text-lg font-bold text-orange-700 dark:text-orange-200">
                  Dashboard Analítico
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground text-base">
                  Visualize estatísticas e relatórios para tomar decisões
                  baseadas em dados.
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden rounded-2xl border-none bg-gradient-to-br from-red-50 via-white to-red-100 shadow-xl transition-transform hover:scale-[1.03] hover:shadow-2xl dark:from-red-950 dark:via-slate-900 dark:to-red-900">
              <div className="absolute -top-10 -right-10 z-0 h-32 w-32 rounded-full bg-red-200 opacity-30 blur-2xl dark:bg-red-800"></div>
              <CardHeader className="relative z-10">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-red-100 shadow-lg transition-transform group-hover:scale-110 dark:bg-red-900/70">
                  <Bell className="h-7 w-7 text-red-600 dark:text-red-300" />
                </div>
                <CardTitle className="text-lg font-bold text-red-700 dark:text-red-200">
                  Lembretes Automáticos
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground text-base">
                  Envie notificações automáticas para reduzir faltas e aumentar
                  a satisfação.
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden rounded-2xl border-none bg-gradient-to-br from-indigo-50 via-white to-indigo-100 shadow-xl transition-transform hover:scale-[1.03] hover:shadow-2xl dark:from-indigo-950 dark:via-slate-900 dark:to-indigo-900">
              <div className="absolute -bottom-10 -left-10 z-0 h-32 w-32 rounded-full bg-indigo-200 opacity-30 blur-2xl dark:bg-indigo-800"></div>
              <CardHeader className="relative z-10">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-100 shadow-lg transition-transform group-hover:scale-110 dark:bg-indigo-900/70">
                  <CreditCard className="h-7 w-7 text-indigo-600 dark:text-indigo-300" />
                </div>
                <CardTitle className="text-lg font-bold text-indigo-700 dark:text-indigo-200">
                  Faturamento Integrado
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground text-base">
                  Acompanhe pagamentos e gere relatórios financeiros com
                  facilidade.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Preços Section */}
      <section id="precos" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="text-foreground mb-4 text-4xl font-bold">
              Planos e Preços
            </h2>
            <p className="text-muted-foreground text-xl">
              Escolha o plano ideal para o tamanho e necessidades do seu
              negócio.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {/* Plano Básico */}
            <Card className="border-border relative border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Essential</CardTitle>
                <div className="text-foreground text-4xl font-bold">
                  R$ 39
                  <span className="text-muted-foreground text-lg font-normal">
                    /mês
                  </span>
                </div>
                <p className="text-muted-foreground">
                  Ideal para profissionais autônomos e pequenas empresas
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-foreground">
                      Até 50 agendamentos/mês
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-foreground">1 profissional</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-foreground">Dashboard básico</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-foreground">Suporte por email</span>
                  </div>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="relative w-full overflow-hidden rounded-full border-2 border-neutral-300 bg-white/80 text-sm font-semibold shadow-md transition-all duration-300 ease-in-out hover:scale-105 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 hover:shadow-lg focus:ring-2 focus:ring-blue-200"
                >
                  <Link
                    href="/auth"
                    className="flex items-center justify-center gap-2"
                  >
                    <span className="relative z-10">Escolher plano</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Plano Profissional */}
            <Card className="relative scale-105 border-2 border-blue-600 shadow-xl">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600">
                Popular
              </Badge>
              <CardHeader>
                <CardTitle className="text-2xl">Premium</CardTitle>
                <div className="text-foreground text-4xl font-bold">
                  R$ 59
                  <span className="text-muted-foreground text-lg font-normal">
                    /mês
                  </span>
                </div>
                <p className="text-muted-foreground">
                  Perfeito para clínicas e consultórios
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-foreground">
                      Até 200 agendamentos/mês
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-foreground">Até 5 profissionais</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-foreground">Dashboard completo</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-foreground">Lembretes SMS/Email</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-foreground">Suporte prioritário</span>
                  </div>
                </div>
                <Button
                  asChild
                  className="group relative w-full overflow-hidden rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-blue-800 py-5 text-lg font-extrabold text-white shadow-xl transition-all duration-300 ease-in-out hover:scale-105 hover:from-blue-800 hover:via-blue-700 hover:to-blue-900 hover:shadow-2xl focus:ring-4 focus:ring-blue-300"
                  style={{
                    boxShadow: "0 8px 32px 0 rgba(59,130,246,0.25)",
                  }}
                >
                  <Link
                    href="/auth"
                    className="flex items-center justify-center gap-2"
                  >
                    <span className="relative z-10">Escolher plano</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Plano Gold */}
            <Card
              className="relative border-[1.5px] border-yellow-400/60"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,215,90,0.08) 0%, rgba(255,215,90,0.04) 100%)",
                // O fundo dourado é sutil e translúcido, mantendo o padrão escuro do tema
              }}
            >
              <CardHeader>
                <CardTitle className="text-2xl">Gold</CardTitle>
                <div className="text-foreground text-4xl font-bold">
                  R$ 99
                  <span className="text-muted-foreground text-lg font-normal">
                    /mês
                  </span>
                </div>
                <p className="text-muted-foreground">
                  Para clínicas e empresas maiores
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-foreground">
                      Agendamentos ilimitados
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-foreground">
                      Até 20 profissionais
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-foreground">Analytics avançados</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-foreground">
                      Integração com outros sistemas
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-foreground">Suporte 24/7</span>
                  </div>
                </div>
                <Button
                  className="group relative w-full overflow-hidden rounded-full border-2 border-yellow-400 bg-white/80 text-sm font-bold text-yellow-700 shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:border-yellow-500 hover:bg-gradient-to-r hover:from-yellow-200 hover:to-yellow-400 hover:text-yellow-900"
                  variant="outline"
                  asChild
                  style={{
                    boxShadow: "0 4px 24px 0 rgba(255,215,90,0.15)",
                  }}
                >
                  <Link
                    href="/auth"
                    className="relative z-10 flex items-center justify-center gap-2"
                  >
                    <span>Escolher plano</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contato Section */}
      <section
        id="contato"
        className="via-background to-muted/60 dark:via-background border-muted relative overflow-hidden border-t bg-gradient-to-br from-blue-50 py-24 dark:from-[#181c2a] dark:to-[#23263a]"
      >
        {/* Elementos gráficos de fundo */}
        <div className="pointer-events-none absolute -top-32 -left-32 z-0 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-900/30"></div>
        <div className="bg-primary/20 dark:bg-primary/30 pointer-events-none absolute right-0 bottom-0 z-0 h-72 w-72 rounded-full blur-2xl"></div>
        <div className="relative z-10 container mx-auto px-4">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
            {/* Card de contato */}
            <div className="from-primary/90 dark:from-primary/80 relative flex flex-col justify-center space-y-8 rounded-3xl bg-gradient-to-br to-blue-700/80 p-10 shadow-xl dark:to-blue-900/80">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white/20 p-3">
                  <Contact className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-4xl font-extrabold text-white drop-shadow-lg">
                  Fale Conosco
                </h2>
              </div>
              <p className="text-lg text-white/80">
                Pronto para transformar a gestão de agendamentos do seu negócio?
                Nossa equipe está à disposição para ajudar!
              </p>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-white/20 p-2">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Email</p>
                    <a
                      href="mailto:contato@magendy.com.br"
                      className="text-white/80 transition hover:underline"
                    >
                      contato@magendy.com.br
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-white/20 p-2">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Telefone</p>
                    <a
                      href="tel:+551134567890"
                      className="text-white/80 transition hover:underline"
                    >
                      (77) 98125-7722
                    </a>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-transparent px-0 text-lg hover:bg-transparent">
                <Link
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 via-green-500 to-lime-400 px-4 py-3 font-semibold text-white shadow-xl transition-all duration-300 ease-in-out hover:scale-105 hover:from-green-600 hover:via-emerald-500 hover:to-green-400 hover:shadow-2xl"
                  href="https://wa.me/551134567890"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>
                    <WhatsappIcon />
                    <style jsx>{`
                      span :global(svg) {
                        width: 1.5rem !important;
                        height: 1.5rem !important;
                      }
                    `}</style>
                  </span>
                  WhatsApp
                </Link>
              </Button>
            </div>

            {/* Card do formulário */}
            <div className="border-primary/30 relative flex flex-col justify-center space-y-8 rounded-3xl border bg-white/80 p-10 shadow-xl dark:bg-[#181c2a]/80">
              <div className="mb-2 flex items-center gap-3">
                <FileSpreadsheet className="text-primary h-8 w-8" />
                <h3 className="text-foreground text-2xl font-bold">
                  Envie uma mensagem
                </h3>
              </div>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="text-foreground mb-2 block text-sm font-semibold">
                    Nome
                  </label>
                  <Input
                    placeholder="Seu nome completo"
                    className="border-primary/20 focus:border-primary focus:ring-primary border bg-white/90 transition focus:ring-2 dark:bg-[#23263a]/80"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="text-foreground mb-2 block text-sm font-semibold">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    className="border-primary/20 focus:border-primary focus:ring-primary border bg-white/90 transition focus:ring-2 dark:bg-[#23263a]/80"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="text-foreground mb-2 block text-sm font-semibold">
                    Mensagem
                  </label>
                  <textarea
                    className="border-primary/20 text-foreground focus:border-primary focus:ring-primary min-h-[120px] w-full rounded-md border bg-white/90 px-3 py-2 transition focus:ring-2 focus:outline-none dark:bg-[#23263a]/80"
                    placeholder="Digite sua mensagem..."
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                  />
                </div>
                <Button
                  type="submit"
                  className="from-primary hover:to-primary w-full transform rounded-full bg-gradient-to-r via-blue-700 to-blue-950 py-6 text-lg font-bold shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-105 hover:from-blue-950 hover:via-blue-800 hover:shadow-2xl"
                  disabled={isSubmitting}
                >
                  <Send className="mr-2 inline-block h-5 w-5" />
                  {isSubmitting ? "Enviando..." : "Enviar mensagem"}
                </Button>
              </form>
              <div className="pointer-events-none absolute -top-8 -right-8 opacity-30">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                  <circle cx="60" cy="60" r="60" fill="url(#paint0_radial)" />
                  <defs>
                    <radialGradient
                      id="paint0_radial"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientTransform="translate(60 60) scale(60)"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#3b82f6" />
                      <stop offset="1" stopColor="#6366f1" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-muted text-foreground border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Image
                  src={
                    typeof window !== "undefined" &&
                    window.matchMedia("(prefers-color-scheme: dark)").matches
                      ? Logo
                      : Logo2
                  }
                  alt="logo-m-agendy"
                  width={150}
                  height={50}
                  className="block dark:hidden"
                />
                <Image
                  src={Logo2}
                  alt="logo-m-agendy"
                  width={150}
                  height={50}
                  className="hidden dark:block"
                />
              </div>
              <p className="text-muted-foreground">
                Simplifique os agendamentos do seu negócio de forma eficiente.
              </p>
            </div>

            <div>
              <h4 className="mb-4 font-semibold">Links Rápidos</h4>
              <div className="space-y-2">
                <Link
                  href="#recursos"
                  className="text-muted-foreground hover:text-primary block transition-colors"
                >
                  Recursos
                </Link>
                <Link
                  href="#beneficios"
                  className="text-muted-foreground hover:text-primary block transition-colors"
                >
                  Benefícios
                </Link>
                <Link
                  href="#precos"
                  className="text-muted-foreground hover:text-primary block transition-colors"
                >
                  Preços
                </Link>
                <Link
                  href="#contato"
                  className="text-muted-foreground hover:text-primary block transition-colors"
                >
                  Contato
                </Link>
              </div>
            </div>

            <div>
              <h4 className="mb-4 font-semibold">Recursos</h4>
              <div className="space-y-2">
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary block transition-colors"
                >
                  Blog
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary block transition-colors"
                >
                  Tutoriais
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary block transition-colors"
                >
                  FAQ
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary block transition-colors"
                >
                  Suporte
                </Link>
              </div>
            </div>

            <div>
              <h4 className="mb-4 font-semibold">Legal</h4>
              <div className="space-y-2">
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary block transition-colors"
                >
                  Termos de Uso
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary block transition-colors"
                >
                  Política de Privacidade
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary block transition-colors"
                >
                  Cookies
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary block transition-colors"
                >
                  LGPD
                </Link>
              </div>
            </div>
          </div>

          <div className="border-muted text-muted-foreground mt-8 border-t pt-8 text-center">
            <p>
              © {new Date().getFullYear()} M.Agendy. Todos os direitos
              reservados. Desenvolvido por{" "}
              <Link
                href="https://matheusqueiroz.dev.br"
                className="text-primary hover:text-primary/80"
              >
                Matheus Queiroz
              </Link>
              .
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
