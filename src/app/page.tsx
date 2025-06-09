"use client";

import {
  BarChart3,
  Bell,
  Calendar,
  Check,
  Contact,
  Eye,
  FileSpreadsheet,
  Mail,
  Menu,
  Phone,
  Send,
  Star,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { ThemeToggle } from "@/components/theme-toggle";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import WhatsappIcon from "@/components/ui/whatsapp-icon";
import { useThemeDetection } from "@/hooks/use-theme-detection";

import DashboardDarkImage from "../../public/images/dashboard-dark-image.png";
import DashboardLightImage from "../../public/images/dashboard-light-image.png";
import Logo from "../../public/images/logo-m-agendy-com-nome.png";
import Logo2 from "../../public/images/logo-m-agendy-com-nome-2.png";

const HomePage = () => {
  const { isDark, mounted } = useThemeDetection();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            {mounted ? (
              <>
                <Image
                  src={isDark ? Logo2 : Logo}
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
              </>
            ) : (
              <Image src={Logo} alt="logo-m-agendy" width={210} height={70} />
            )}
          </div>

          {/* Desktop Navbar */}
          <nav className="hidden items-center gap-6 md:flex">
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
              href="#faq"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="#contato"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Contato
            </Link>
            <Link
              href="/about"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Sobre nós
            </Link>
          </nav>

          {/* Mobile Menu Button and Theme Toggle */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="bg-background border-t md:hidden">
            <nav className="container mx-auto flex flex-col space-y-4 px-4 py-4">
              <Link
                href="#beneficios"
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Benefícios
              </Link>
              <Link
                href="#recursos"
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Recursos
              </Link>
              <Link
                href="#precos"
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Preços
              </Link>
              <Link
                href="#contato"
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contato
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-4">
              <h1 className="text-foreground text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl">
                Simplifique os{" "}
                <span className="text-blue-600">agendamentos</span> do{" "}
                <span className="text-blue-600">seu negócio</span> de forma
                eficiente.
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed sm:text-xl">
                Ideal para empresas, consultórios e profissionais autônomos que
                desejam organizar e otimizar os agendamentos das consultas.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                asChild
                className="animate-shine relative w-full overflow-hidden rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-blue-800 px-167 py-4 text-base font-extrabold text-white shadow-xl transition-all duration-300 ease-in-out hover:scale-105 hover:from-blue-800 hover:via-blue-700 hover:to-blue-900 hover:shadow-2xl focus:ring-4 focus:ring-blue-300 sm:flex-2 sm:px-10 sm:py-6 sm:text-lg"
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
                className="relative w-full rounded-full border-2 border-blue-600 bg-white/80 px-6 py-4 font-semibold text-blue-700 transition-all duration-300 ease-in-out hover:scale-105 hover:border-blue-800 hover:bg-blue-50 hover:text-blue-900 hover:shadow-lg focus:ring-2 focus:ring-blue-200 sm:flex-1 sm:px-8 sm:py-6"
              >
                <Link
                  href="/demo"
                  className="flex items-center justify-center gap-2"
                >
                  <Eye className="h-5 w-5 text-blue-600 transition-transform duration-300 group-hover:rotate-6" />
                  Ver demonstração
                </Link>
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

          {/* Lado direito: Imagem elegante e animada */}
          <div className="relative mt-8 flex items-center justify-center lg:mt-0">
            {/* Fundo com gradiente animado */}
            <div className="absolute inset-0 z-0">
              <svg
                className="h-full w-full"
                viewBox="0 0 500 500"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ filter: "blur(8px)" }}
              >
                <defs>
                  <radialGradient id="grad1" cx="50%" cy="50%" r="80%">
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#1e293b" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <ellipse cx="250" cy="250" rx="220" ry="180" fill="url(#grad1)">
                  <animate
                    attributeName="rx"
                    values="220;200;220"
                    dur="6s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="ry"
                    values="180;200;180"
                    dur="7s"
                    repeatCount="indefinite"
                  />
                </ellipse>
              </svg>
            </div>
            {/* Imagem principal com efeito de elevação, brilho e sombra azul */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative overflow-hidden rounded-xl border-4 border-blue-100 bg-white/80 shadow-2xl transition-transform duration-500 hover:scale-105 dark:border-blue-900 dark:bg-slate-900/80">
                {/* Sombra extra para a imagem do dashboard */}
                <div
                  className="pointer-events-none absolute inset-0 z-0"
                  style={{
                    filter: "blur(24px)",
                    boxShadow:
                      "0 16px 64px 0 rgba(59,130,246,0.25), 0 2px 24px 0 rgba(30,58,138,0.10)",
                  }}
                ></div>
                {/* Imagem para tema claro */}
                <Image
                  src={DashboardLightImage}
                  alt="Dashboard moderno do M.Agendy"
                  className="animate-fade-in shadow-blue-dashboard block h-auto w-full max-w-[400px] object-cover sm:max-w-[600px] lg:max-w-[800px] dark:hidden"
                  style={{
                    boxShadow:
                      "0 0 40px 0 rgba(59,130,246,0.35), 0 8px 32px 0 rgba(59,130,246,0.18), 0 1.5px 8px 0 rgba(30,58,138,0.10), 0 16px 64px 0 rgba(59,130,246,0.18)",
                  }}
                />
                {/* Imagem para tema escuro */}
                <Image
                  src={DashboardDarkImage}
                  alt="Dashboard moderno do M.Agendy"
                  className="animate-fade-in shadow-blue-dashboard hidden h-auto w-full max-w-[400px] object-cover sm:max-w-[600px] lg:max-w-[800px] dark:block"
                  style={{
                    boxShadow:
                      "0 0 40px 0 rgba(59,130,246,0.35), 0 8px 32px 0 rgba(59,130,246,0.18), 0 1.5px 8px 0 rgba(30,58,138,0.10), 0 16px 64px 0 rgba(59,130,246,0.18)",
                  }}
                />
                {/* Glow animado */}
                <div className="animate-pulse-glow pointer-events-none absolute -bottom-8 left-1/2 h-16 w-48 -translate-x-1/2 rounded-full bg-blue-400/30 blur-2xl sm:h-24 sm:w-72"></div>
              </div>
              {/* Elementos gráficos decorativos */}
              <div className="absolute -top-4 -right-4 z-20 sm:-top-8 sm:-right-8">
                <svg
                  width="60"
                  height="60"
                  viewBox="0 0 80 80"
                  fill="none"
                  className="sm:h-20 sm:w-20"
                >
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="#60a5fa"
                    strokeWidth="4"
                    strokeDasharray="8 8"
                    className="animate-spin-slow"
                  />
                </svg>
              </div>
              <div className="absolute bottom-0 left-0 z-20">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 60 60"
                  fill="none"
                  className="sm:h-[60px] sm:w-[60px]"
                >
                  <rect
                    x="10"
                    y="10"
                    width="40"
                    height="40"
                    rx="12"
                    fill="#38bdf8"
                    fillOpacity="0.15"
                  />
                </svg>
              </div>
            </div>
            <style jsx>{`
              .animate-fade-in {
                animation: fadeIn 1.2s cubic-bezier(0.4, 0, 0.2, 1);
              }
              @keyframes fadeIn {
                from {
                  opacity: 0;
                  transform: translateY(30px) scale(0.98);
                }
                to {
                  opacity: 1;
                  transform: translateY(0) scale(1);
                }
              }
              .animate-pulse-glow {
                animation: pulseGlow 2.5s infinite alternate;
              }
              @keyframes pulseGlow {
                0% {
                  opacity: 0.5;
                  transform: scaleX(1) scaleY(1);
                }
                100% {
                  opacity: 1;
                  transform: scaleX(1.1) scaleY(1.2);
                }
              }
              .animate-spin-slow {
                animation: spinSlow 12s linear infinite;
                transform-origin: 40px 40px;
              }
              @keyframes spinSlow {
                0% {
                  transform: rotate(0deg);
                }
                100% {
                  transform: rotate(360deg);
                }
              }
              /* Sombra azul personalizada para a imagem do dashboard */
              .shadow-blue-dashboard {
                box-shadow:
                  0 0 40px 0 rgba(59, 130, 246, 0.35),
                  0 8px 32px 0 rgba(59, 130, 246, 0.18),
                  0 1.5px 8px 0 rgba(30, 58, 138, 0.1);
              }
            `}</style>
          </div>
        </div>
      </section>

      {/* Sobre Section */}
      <section
        id="sobre"
        className="from-background to-background relative z-10 bg-gradient-to-b via-blue-50/60 py-20 sm:py-32 dark:via-blue-950/60"
      >
        <div className="container mx-auto flex flex-col items-center px-4">
          {/* Título e descrição */}
          <div className="mb-16 max-w-3xl text-center">
            <h2 className="animate-fade-in mb-4 text-5xl font-extrabold tracking-tight text-blue-700 sm:text-6xl dark:text-blue-300">
              O que é o <span className="text-primary">M.Agendy</span>?
            </h2>
            <p className="text-muted-foreground animate-fade-in mb-8 text-xl [animation-delay:0.2s] sm:text-2xl">
              <span className="font-semibold text-blue-600 dark:text-blue-200">
                M.Agendy
              </span>{" "}
              é a plataforma inteligente para gestão de agendamentos,
              profissionais e comunicação, feita para clínicas e consultórios
              que buscam eficiência, automação e experiência digital de alto
              nível.
            </p>
            <div className="animate-fade-in flex flex-wrap justify-center gap-4 [animation-delay:0.4s]">
              <Badge
                variant="outline"
                className="rounded-full bg-blue-100 px-4 py-2 text-base font-medium text-blue-700 shadow-md dark:bg-blue-900/60 dark:text-blue-200"
              >
                100% Online
              </Badge>
              <Badge
                variant="outline"
                className="rounded-full bg-green-100 px-4 py-2 text-base font-medium text-green-700 shadow-md dark:bg-green-900/60 dark:text-green-200"
              >
                Seguro & Confiável
              </Badge>
              <Badge
                variant="outline"
                className="rounded-full bg-yellow-100 px-4 py-2 text-base font-medium text-yellow-700 shadow-md dark:bg-yellow-900/60 dark:text-yellow-200"
              >
                Suporte Humanizado
              </Badge>
            </div>
          </div>

          {/* Mapa mental visual */}
          <div className="relative flex w-full max-w-6xl flex-col items-center gap-16 lg:flex-row">
            {/* Gráfico/Mapa mental central */}
            <div className="relative flex flex-1 items-center justify-center">
              <div className="relative z-10 flex flex-col items-center">
                <div className="shadow-blue-dashboard animate-fade-in relative mb-4 flex h-40 w-40 items-center justify-center rounded-full border-4 border-blue-200 bg-white shadow-2xl dark:border-blue-900 dark:bg-slate-900">
                  <Image
                    src={
                      mounted && isDark
                        ? DashboardDarkImage
                        : DashboardLightImage
                    }
                    alt="Dashboard M.Agendy"
                    width={160}
                    height={160}
                    className="h-32 w-32 rounded-full object-contain transition-all duration-500"
                    priority
                  />
                  {/* Glow animado */}
                  <div className="animate-pulse-glow pointer-events-none absolute -inset-2 rounded-full border-2 border-blue-200 opacity-40 dark:border-blue-800"></div>
                </div>
                <span className="text-lg font-bold text-blue-700 dark:text-blue-200">
                  Dashboard Inteligente
                </span>
              </div>
              {/* Linhas e ícones do mapa mental */}
              <div className="absolute top-1/2 left-1/2 z-0 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2">
                {/* Linha e nó: Painel Inteligente */}
                <div className="absolute top-0 left-1/2 flex -translate-x-1/2 flex-col items-center">
                  <div className="h-10 w-1 bg-blue-300 dark:bg-blue-800"></div>
                  <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 shadow-md dark:bg-blue-900/60">
                    <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                    <span className="text-base font-semibold text-blue-700 dark:text-blue-200">
                      Painel Inteligente
                    </span>
                  </div>
                </div>
                {/* Linha e nó: Comunicação */}
                <div className="absolute top-1/2 right-0 flex -translate-y-1/2 flex-col items-end">
                  <div className="h-1 w-10 bg-green-300 dark:bg-green-800"></div>
                  <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2 shadow-md dark:bg-green-900/60">
                    <Send className="h-6 w-6 text-green-600 dark:text-green-300" />
                    <span className="text-base font-semibold text-green-700 dark:text-green-200">
                      Comunicação
                    </span>
                  </div>
                </div>
                {/* Linha e nó: Gestão de Equipe */}
                <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 flex-col items-center">
                  <div className="h-10 w-1 bg-purple-300 dark:bg-purple-800"></div>
                  <div className="flex items-center gap-2 rounded-xl bg-purple-50 px-4 py-2 shadow-md dark:bg-purple-900/60">
                    <UserPlus className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                    <span className="text-base font-semibold text-purple-700 dark:text-purple-200">
                      Equipe
                    </span>
                  </div>
                </div>
                {/* Linha e nó: Experiência do Cliente */}
                <div className="absolute top-1/2 left-0 flex -translate-y-1/2 flex-col items-start">
                  <div className="h-1 w-10 bg-pink-300 dark:bg-pink-800"></div>
                  <div className="flex items-center gap-2 rounded-xl bg-pink-50 px-4 py-2 shadow-md dark:bg-pink-900/60">
                    <Eye className="h-6 w-6 text-pink-600 dark:text-pink-300" />
                    <span className="text-base font-semibold text-pink-700 dark:text-pink-200">
                      Cliente
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalhes dos recursos em cards */}
            <div className="grid w-full max-w-xl grid-cols-1 gap-6 sm:grid-cols-2">
              <Card className="group animate-fade-in border-none bg-gradient-to-br from-blue-50 via-white to-blue-100 shadow-xl [animation-delay:0.2s] dark:from-blue-950 dark:via-slate-900 dark:to-blue-900">
                <CardHeader className="flex flex-row items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-300" />
                  <CardTitle className="text-lg font-bold text-blue-700 dark:text-blue-200">
                    Painel Inteligente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-base">
                    Visualize métricas, agendamentos e notificações em tempo
                    real. Painel desenhado para facilitar decisões e
                    acompanhamento do seu negócio.
                  </p>
                </CardContent>
              </Card>
              <Card className="group animate-fade-in border-none bg-gradient-to-br from-green-50 via-white to-green-100 shadow-xl [animation-delay:0.4s] dark:from-green-950 dark:via-slate-900 dark:to-green-900">
                <CardHeader className="flex flex-row items-center gap-3">
                  <Send className="h-8 w-8 text-green-600 dark:text-green-300" />
                  <CardTitle className="text-lg font-bold text-green-700 dark:text-green-200">
                    Comunicação Automatizada
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-base">
                    Envie lembretes automáticos por WhatsApp, SMS e e-mail,
                    reduzindo faltas e otimizando o relacionamento com seus
                    clientes.
                  </p>
                </CardContent>
              </Card>
              <Card className="group animate-fade-in border-none bg-gradient-to-br from-purple-50 via-white to-purple-100 shadow-xl [animation-delay:0.6s] dark:from-purple-950 dark:via-slate-900 dark:to-purple-900">
                <CardHeader className="flex flex-row items-center gap-3">
                  <UserPlus className="h-8 w-8 text-purple-600 dark:text-purple-300" />
                  <CardTitle className="text-lg font-bold text-purple-700 dark:text-purple-200">
                    Gestão de Equipe
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-base">
                    Cadastre profissionais, defina horários, especialidades e
                    acompanhe o desempenho de cada membro da equipe.
                  </p>
                </CardContent>
              </Card>
              <Card className="group animate-fade-in border-none bg-gradient-to-br from-pink-50 via-white to-pink-100 shadow-xl [animation-delay:0.8s] dark:from-pink-950 dark:via-slate-900 dark:to-pink-900">
                <CardHeader className="flex flex-row items-center gap-3">
                  <Eye className="h-8 w-8 text-pink-600 dark:text-pink-300" />
                  <CardTitle className="text-lg font-bold text-pink-700 dark:text-pink-200">
                    Experiência do Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-base">
                    Clientes agendam, remarcam e cancelam consultas de forma
                    simples, rápida e intuitiva, direto do celular ou
                    computador.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA */}
          <div className="animate-fade-in mt-20 flex flex-col items-center gap-4 [animation-delay:1s]">
            <span className="text-muted-foreground text-lg">
              Pronto para transformar sua gestão?
            </span>
            <Link href="#precos">
              <Button
                size="lg"
                className="group px-8 py-5 text-lg font-bold shadow-lg"
              >
                <span className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400 transition-transform group-hover:scale-110" />
                  Conheça nossos planos
                </span>
              </Button>
            </Link>
            <span className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
              <WhatsappIcon />
              Suporte rápido via WhatsApp
            </span>
          </div>
        </div>
        {/* Efeitos decorativos modernos */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 h-[320px] w-[640px] -translate-x-1/2 rounded-full bg-blue-200/30 opacity-60 blur-3xl dark:bg-blue-900/30"></div>
          <div className="absolute right-0 bottom-0 h-[200px] w-[340px] rounded-full bg-green-200/20 opacity-40 blur-2xl dark:bg-green-900/20"></div>
          <div className="absolute top-1/3 left-0 h-32 w-32 rounded-full bg-pink-200/20 opacity-30 blur-2xl dark:bg-pink-900/20"></div>
        </div>
        {/* Efeito decorativo de fundo */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-blue-200/30 opacity-60 blur-3xl dark:bg-blue-900/30"></div>
          <div className="absolute right-0 bottom-0 h-[180px] w-[300px] rounded-full bg-green-200/20 opacity-40 blur-2xl dark:bg-green-900/20"></div>
        </div>
      </section>

      {/* Recursos Section */}
      <section id="recursos" className="bg-muted/50 py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center sm:mb-16">
            <h2 className="text-foreground mb-4 text-3xl font-bold sm:text-4xl">
              Recursos
            </h2>
            <p className="text-muted-foreground text-lg sm:text-xl">
              Descubra como o M.Agendy pode transformar seu negócio.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
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
                  agendamentos com apenas alguns cliques.
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
                  Gestão de Profissionais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Cadastre profissionais da mais diversas especialidades e
                  gerencie disponibilidades de cada um de forma eficiente.
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden rounded-2xl border-none bg-gradient-to-br from-purple-50 via-white to-purple-100 shadow-xl transition-transform hover:scale-[1.03] hover:shadow-2xl dark:from-purple-950 dark:via-slate-900 dark:to-purple-900">
              <div className="absolute -top-10 -left-10 z-0 h-32 w-32 rounded-full bg-purple-200 opacity-30 blur-2xl dark:bg-purple-800"></div>
              <CardHeader className="relative z-10">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-purple-100 shadow-lg transition-transform group-hover:scale-110 dark:bg-purple-900/70">
                  <UserPlus className="h-7 w-7 text-purple-600 dark:text-purple-300" />
                </div>
                <CardTitle className="text-lg font-bold text-purple-700 dark:text-purple-200">
                  Cadastro de Clientes/Pacientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Mantenha um registro organizado de todos os seus
                  clientes/pacientes e histórico de agendamentos.
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
              <CardContent>
                <p className="text-muted-foreground">
                  Visualize estatísticas baseada em dados para tomar decisões
                  estratégicas e melhorar a gestão do seu negócio.
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
              <CardContent>
                <p className="text-muted-foreground">
                  Envie notificações automáticas para reduzir faltas e aumentar
                  a satisfação dos seus clientes/pacientes.
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden rounded-2xl border-none bg-gradient-to-br from-indigo-50 via-white to-indigo-100 shadow-xl transition-transform hover:scale-[1.03] hover:shadow-2xl dark:from-indigo-950 dark:via-slate-900 dark:to-indigo-900">
              <div className="absolute -bottom-10 -left-10 z-0 h-32 w-32 rounded-full bg-indigo-200 opacity-30 blur-2xl dark:bg-indigo-800"></div>
              <CardHeader className="relative z-10">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-100 shadow-lg transition-transform group-hover:scale-110 dark:bg-indigo-900/70">
                  <Star className="h-7 w-7 text-indigo-600 dark:text-indigo-300" />
                </div>
                <CardTitle className="text-lg font-bold text-indigo-700 dark:text-indigo-200">
                  Ranking de Profissionais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Acompanhe o ranking dos profissionais da sua equipe e
                  incentive melhorias para elevar o padrão de atendimento.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Preços Section */}
      <section id="precos" className="py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center sm:mb-16">
            <h2 className="text-foreground mb-4 text-3xl font-bold sm:text-4xl">
              Planos e Preços
            </h2>
            <p className="text-muted-foreground text-lg sm:text-xl">
              Escolha o plano ideal para o tamanho e necessidades do seu
              negócio.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Plano Básico */}
            <Card className="border-border relative border-2">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">Essential</CardTitle>
                <div className="text-foreground text-3xl font-bold sm:text-4xl">
                  R$ 39
                  <span className="text-muted-foreground text-base font-normal sm:text-lg">
                    /mês
                  </span>
                </div>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Ideal para profissionais autônomos e pequenas empresas
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-foreground text-sm sm:text-base">
                      Até 50 agendamentos/mês
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-foreground text-sm sm:text-base">
                      1 profissional
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-foreground text-sm sm:text-base">
                      Dashboard básico
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-foreground text-sm sm:text-base">
                      Suporte por email
                    </span>
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
            <Card className="relative scale-100 border-2 border-blue-600 shadow-xl md:col-span-2 lg:col-span-1 lg:col-start-2 lg:col-end-3 lg:scale-105">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600">
                Popular
              </Badge>
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">Premium</CardTitle>
                <div className="text-foreground text-3xl font-bold sm:text-4xl">
                  R$ 59
                  <span className="text-muted-foreground text-base font-normal sm:text-lg">
                    /mês
                  </span>
                </div>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Perfeito para clínicas e consultórios
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-foreground text-sm sm:text-base">
                      Até 200 agendamentos/mês
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-foreground text-sm sm:text-base">
                      Até 5 profissionais
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-foreground text-sm sm:text-base">
                      Dashboard completo
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-foreground text-sm sm:text-base">
                      Lembretes SMS/Email
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-foreground text-sm sm:text-base">
                      Suporte prioritário
                    </span>
                  </div>
                </div>
                <Button
                  asChild
                  className="group relative w-full overflow-hidden rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-blue-800 py-4 text-base font-extrabold text-white shadow-xl transition-all duration-300 ease-in-out hover:scale-105 hover:from-blue-800 hover:via-blue-700 hover:to-blue-900 hover:shadow-2xl focus:ring-4 focus:ring-blue-300 sm:py-5 sm:text-lg"
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
              className="relative border-[1.5px] border-yellow-400/60 md:col-span-2 lg:col-span-1"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,215,90,0.08) 0%, rgba(255,215,90,0.04) 100%)",
                // O fundo dourado é sutil e translúcido, mantendo o padrão escuro do tema
              }}
            >
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">Gold</CardTitle>
                <div className="text-foreground text-3xl font-bold sm:text-4xl">
                  R$ 99
                  <span className="text-muted-foreground text-base font-normal sm:text-lg">
                    /mês
                  </span>
                </div>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Para clínicas e empresas maiores
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-foreground text-sm sm:text-base">
                      Agendamentos ilimitados
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-foreground text-sm sm:text-base">
                      Até 20 profissionais
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-foreground text-sm sm:text-base">
                      Analytics avançados
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-foreground text-sm sm:text-base">
                      Integração com outros sistemas
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-foreground text-sm sm:text-base">
                      Suporte 24/7
                    </span>
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

      {/* FAQ Section */}
      <section
        id="faq"
        className="via-background to-muted/60 dark:via-background border-muted relative overflow-hidden border-t bg-gradient-to-br from-blue-50 py-16 sm:py-24 dark:from-[#181c2a] dark:to-[#23263a]"
      >
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-foreground mb-4 text-center text-3xl font-extrabold sm:text-4xl">
              Perguntas Frequentes
            </h2>
            <p className="text-muted-foreground mb-10 text-center text-base sm:text-lg">
              Tire suas dúvidas sobre o funcionamento do M.Agendy. Se não
              encontrar sua resposta, entre em contato conosco para que possamos
              te ajudar.
            </p>
            <div className="rounded-2xl bg-white/80 p-4 shadow-lg sm:p-8 dark:bg-[#23263a]/80">
              <Accordion
                type="single"
                collapsible
                className="w-full"
                defaultValue="item-1"
              >
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-base font-semibold sm:text-lg">
                    O que é o M.Agendy?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm text-balance sm:text-base">
                    <p>
                      O M.Agendy é uma plataforma online para gestão de
                      agendamentos, ideal profissionais autônomos, clínicas,
                      consultórios, e outros estabelecimentos que necessitam
                      organizar horários de forma eficiente e profissional.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-base font-semibold sm:text-lg">
                    Preciso instalar algum programa para usar?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm text-balance sm:text-base">
                    <p>
                      Não! O M.Agendy é 100% online e pode ser acessado de
                      qualquer dispositivo com internet, sem necessidade de
                      instalação.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-base font-semibold sm:text-lg">
                    Posso testar antes de contratar?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm text-balance sm:text-base">
                    <p>
                      Sim! Oferecemos um período de teste gratuito para que você
                      possa conhecer todas as funcionalidades antes de escolher
                      o plano ideal para o seu negócio.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-base font-semibold sm:text-lg">
                    É possível integrar o M.Agendy com outros sistemas?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm text-balance sm:text-base">
                    <p>
                      Sim, o M.Agendy possui integrações com diversos sistemas e
                      ferramentas. Caso precise de uma integração específica,
                      entre em contato com nosso suporte.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-base font-semibold sm:text-lg">
                    Meus dados estão seguros na plataforma?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm text-balance sm:text-base">
                    <p>
                      Sim! Utilizamos criptografia e seguimos as melhores
                      práticas de segurança para garantir a proteção dos seus
                      dados e dos seus clientes.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-6">
                  <AccordionTrigger className="text-base font-semibold sm:text-lg">
                    Como funciona o suporte?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm text-balance sm:text-base">
                    <p>
                      Nosso suporte está disponível 24/7 via e-mail, WhatsApp e
                      chat. Estamos prontos para te ajudar sempre que precisar!
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-7">
                  <AccordionTrigger className="text-base font-semibold sm:text-lg">
                    Como faço para cancelar minha assinatura?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm text-balance sm:text-base">
                    <p>
                      Você pode cancelar sua assinatura a qualquer momento
                      diretamente pelo painel do sistema, sem burocracia e sem
                      taxas extras.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      {/* Contato Section */}
      <section
        id="contato"
        className="via-background to-muted/60 dark:via-background border-muted relative overflow-hidden border-t bg-gradient-to-br from-blue-50 py-16 sm:py-24 dark:from-[#181c2a] dark:to-[#23263a]"
      >
        {/* Elementos gráficos de fundo */}
        <div className="pointer-events-none absolute -top-32 -left-32 z-0 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-900/30"></div>
        <div className="bg-primary/20 dark:bg-primary/30 pointer-events-none absolute right-0 bottom-0 z-0 h-72 w-72 rounded-full blur-2xl"></div>
        <div className="relative z-10 container mx-auto px-4">
          <div className="mx-auto grid max-w-6xl gap-8 sm:gap-12 lg:grid-cols-2">
            {/* Card de contato */}
            <div className="from-primary/90 dark:from-primary/80 relative flex flex-col justify-between rounded-3xl bg-gradient-to-br to-blue-700/80 p-6 shadow-xl sm:p-10 dark:to-blue-900/80">
              {/* Título e ícone alinhados */}
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                  <Contact className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-extrabold text-white drop-shadow-lg sm:text-3xl">
                  Fale Conosco
                </h2>
              </div>
              <p className="mb-6 text-base text-white/80 sm:text-lg">
                Pronto para transformar a gestão de agendamentos do seu negócio?
                Nossa equipe está à disposição para te ajudar! Entre em contato
                conosco.
              </p>
              <div className="mb-8 space-y-4 sm:space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white sm:text-base">
                      Email
                    </p>
                    <a
                      href="mailto:contato@magendy.com.br"
                      className="text-sm text-white/80 transition hover:underline sm:text-base"
                    >
                      contato@magendy.com.br
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white sm:text-base">
                      Telefone
                    </p>
                    <a
                      href="tel:+5577981257722"
                      className="text-sm text-white/80 transition hover:underline sm:text-base"
                    >
                      (77) 98125-7722
                    </a>
                  </div>
                </div>
              </div>
              <div className="flex">
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
            </div>

            {/* Card do formulário */}
            <div className="border-primary/30 relative flex flex-col justify-between rounded-3xl border bg-white/80 p-6 shadow-xl sm:p-10 dark:bg-[#181c2a]/80">
              {/* Título e ícone alinhados */}
              <div className="mb-4 flex items-center gap-4">
                <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
                  <FileSpreadsheet className="text-primary h-8 w-8" />
                </div>
                <h2 className="text-foreground text-2xl font-bold sm:text-3xl">
                  Envie uma mensagem
                </h2>
              </div>
              <form
                className="flex flex-1 flex-col space-y-4 sm:space-y-6"
                onSubmit={handleSubmit}
              >
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
                    required
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
                    required
                  />
                </div>
                <div>
                  <label className="text-foreground mb-2 block text-sm font-semibold">
                    Mensagem
                  </label>
                  <textarea
                    className="border-primary/20 text-foreground focus:border-primary focus:ring-primary min-h-[100px] w-full rounded-md border bg-white/90 px-3 py-2 transition focus:ring-2 focus:outline-none sm:min-h-[120px] dark:bg-[#23263a]/80"
                    placeholder="Digite sua mensagem..."
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="flex">
                  <Button
                    type="submit"
                    className="from-primary hover:to-primary w-full transform rounded-full bg-gradient-to-r via-blue-700 to-blue-950 py-4 text-base font-bold shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-105 hover:from-blue-950 hover:via-blue-800 hover:shadow-2xl sm:py-6 sm:text-lg"
                    disabled={isSubmitting}
                  >
                    <Send className="mr-2 inline-block h-6 w-6 sm:h-7 sm:w-7" />
                    {isSubmitting ? "Enviando..." : "Enviar mensagem"}
                  </Button>
                </div>
              </form>
              <div className="pointer-events-none absolute -top-8 -right-8 opacity-30">
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 120 120"
                  fill="none"
                  className="sm:h-[120px] sm:w-[120px]"
                >
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
      <footer className="bg-background border-muted text-foreground border-t py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="mb-4 flex items-center gap-2">
                {mounted ? (
                  <>
                    <Image
                      src={isDark ? Logo2 : Logo}
                      alt="logo-m-agendy"
                      width={120}
                      height={40}
                      className="block dark:hidden"
                    />
                    <Image
                      src={Logo2}
                      alt="logo-m-agendy"
                      width={180}
                      height={60}
                      className="hidden dark:block"
                    />
                  </>
                ) : (
                  <Image
                    src={Logo}
                    alt="logo-m-agendy"
                    width={120}
                    height={40}
                  />
                )}
              </div>
              <p className="text-muted-foreground text-sm sm:text-base">
                Simplifique os agendamentos do seu negócio de forma eficiente.
              </p>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold sm:mb-4 sm:text-base">
                Links Rápidos
              </h4>
              <div className="space-y-2">
                <Link
                  href="#recursos"
                  className="text-muted-foreground hover:text-primary block text-sm transition-colors sm:text-base"
                >
                  Recursos
                </Link>
                <Link
                  href="#precos"
                  className="text-muted-foreground hover:text-primary block text-sm transition-colors sm:text-base"
                >
                  Preços
                </Link>
                <Link
                  href="#faq"
                  className="text-muted-foreground hover:text-primary block text-sm transition-colors sm:text-base"
                >
                  FAQ
                </Link>
                <Link
                  href="#contato"
                  className="text-muted-foreground hover:text-primary block text-sm transition-colors sm:text-base"
                >
                  Contato
                </Link>
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold sm:mb-4 sm:text-base">
                Mais informações
              </h4>
              <div className="space-y-2">
                <Link
                  href="/blog"
                  className="text-muted-foreground hover:text-primary block text-sm transition-colors sm:text-base"
                >
                  Blog
                </Link>
                <Link
                  href="/tutorial"
                  className="text-muted-foreground hover:text-primary block text-sm transition-colors sm:text-base"
                >
                  Tutorial
                </Link>
                <Link
                  href="/support"
                  className="text-muted-foreground hover:text-primary block text-sm transition-colors sm:text-base"
                >
                  Suporte
                </Link>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-primary block text-sm transition-colors sm:text-base"
                >
                  Sobre nós
                </Link>
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold sm:mb-4 sm:text-base">
                Políticas
              </h4>
              <div className="space-y-2">
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary block text-sm transition-colors sm:text-base"
                >
                  Termos de Uso
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary block text-sm transition-colors sm:text-base"
                >
                  Política de Privacidade
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary block text-sm transition-colors sm:text-base"
                >
                  Cookies
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary block text-sm transition-colors sm:text-base"
                >
                  LGPD
                </Link>
              </div>
            </div>
          </div>

          <div className="border-muted text-muted-foreground mt-6 border-t pt-6 text-center sm:mt-8 sm:pt-8">
            <p className="text-xs sm:text-sm">
              © {new Date().getFullYear()} M.Agendy. Todos os direitos
              reservados. Desenvolvido por{" "}
              <Link
                href="https://matheusqueiroz.dev.br"
                className="text-primary hover:text-primary/80"
                target="_blank"
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
};

export default HomePage;
