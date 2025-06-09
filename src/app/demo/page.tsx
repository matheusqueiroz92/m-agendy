"use client";

import {
  Activity,
  ArrowRight,
  BarChart3,
  Calendar,
  ChevronRight,
  Clock,
  Play,
  Star,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";

import DashboardDarkImage from "../../../public/images/dashboard-dark-image.png";
import DashboardLightImage from "../../../public/images/dashboard-light-image.png";

const DemoPage = () => {
  return (
    <PageContainer>
      <div className="space-y-12">
        {/* Hero Section */}
        <div className="space-y-6 text-center">
          <div className="space-y-4">
            <Badge variant="secondary" className="px-4 py-2">
              <Play className="mr-2 h-4 w-4" />
              Demonstração Interativa
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
              Explore o <span className="text-blue-600">M.Agendy</span> em ação
            </h1>
            <p className="text-muted-foreground mx-auto max-w-3xl text-xl">
              Veja como nossa plataforma pode transformar a gestão de
              agendamentos do seu negócio. Escolha a melhor forma de explorar!
            </p>
          </div>
        </div>

        {/* Demo Options */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Interactive Demo */}
          <Card className="group relative overflow-hidden border-2 border-blue-200 transition-all duration-300 hover:border-blue-400 hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent" />
            <CardHeader className="relative">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <Badge className="bg-blue-600">Recomendado</Badge>
              </div>
              <CardTitle className="text-xl">Demo Interativa</CardTitle>
              <p className="text-muted-foreground text-sm">
                Teste todas as funcionalidades em um ambiente real com dados
                fictícios
              </p>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <ChevronRight className="h-4 w-4 text-green-600" />
                  <span>Criar agendamentos</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ChevronRight className="h-4 w-4 text-green-600" />
                  <span>Gerenciar pacientes</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ChevronRight className="h-4 w-4 text-green-600" />
                  <span>Dashboard completo</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ChevronRight className="h-4 w-4 text-green-600" />
                  <span>Todas as funcionalidades</span>
                </div>
              </div>
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <Clock className="h-3 w-3" />
                <span>15-20 minutos</span>
              </div>
              <Button
                asChild
                className="w-full bg-blue-600 transition-transform group-hover:scale-105 hover:bg-blue-700"
              >
                <Link
                  href="/demo/interactive"
                  className="flex items-center gap-2"
                >
                  Iniciar Demo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Video Demo */}
          <Card className="group transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-2">
                  <Play className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <CardTitle className="text-xl">Vídeo Demonstração</CardTitle>
              <p className="text-muted-foreground text-sm">
                Assista um overview completo das principais funcionalidades
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <ChevronRight className="h-4 w-4 text-green-600" />
                  <span>Workflow completo</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ChevronRight className="h-4 w-4 text-green-600" />
                  <span>Casos de uso reais</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ChevronRight className="h-4 w-4 text-green-600" />
                  <span>Demonstração guiada</span>
                </div>
              </div>
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <Clock className="h-3 w-3" />
                <span>3-5 minutos</span>
              </div>
              <Button
                asChild
                variant="outline"
                className="w-full group-hover:bg-purple-50 hover:border-purple-300"
              >
                <Link href="/demo/video" className="flex items-center gap-2">
                  Assistir Vídeo
                  <Play className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Scheduled Demo */}
          <Card className="group transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-orange-100 p-2">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <CardTitle className="text-xl">Demo Personalizada</CardTitle>
              <p className="text-muted-foreground text-sm">
                Agende uma demonstração ao vivo com nossa equipe
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <ChevronRight className="h-4 w-4 text-green-600" />
                  <span>Consultoria personalizada</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ChevronRight className="h-4 w-4 text-green-600" />
                  <span>Foco no seu negócio</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ChevronRight className="h-4 w-4 text-green-600" />
                  <span>Tire todas as dúvidas</span>
                </div>
              </div>
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <Clock className="h-3 w-3" />
                <span>30-45 minutos</span>
              </div>
              <Button
                asChild
                variant="outline"
                className="w-full group-hover:bg-orange-50 hover:border-orange-300"
              >
                <Link href="/demo/schedule" className="flex items-center gap-2">
                  Agendar Demo
                  <Calendar className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        <div className="space-y-8">
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-bold">Prévia do Sistema</h2>
            <p className="text-muted-foreground text-lg">
              Veja como é a interface do M.Agendy
            </p>
          </div>

          <div className="relative mx-auto max-w-5xl">
            <div className="relative overflow-hidden rounded-xl border shadow-2xl">
              <Image
                src={DashboardLightImage}
                alt="Dashboard do M.Agendy"
                className="block w-full dark:hidden"
              />
              <Image
                src={DashboardDarkImage}
                alt="Dashboard do M.Agendy"
                className="hidden w-full dark:block"
              />
            </div>
          </div>
        </div>

        {/* Features Highlights */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-fit rounded-full bg-blue-100 p-3">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Dashboard Avançado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Métricas em tempo real, gráficos interativos e insights valiosos
                para seu negócio.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-fit rounded-full bg-green-100 p-3">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Gestão Completa</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Controle total sobre pacientes, médicos e agendamentos em uma
                única plataforma.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-fit rounded-full bg-purple-100 p-3">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Experiência Premium</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Interface moderna, intuitiva e otimizada para máxima
                produtividade.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="space-y-6 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 p-8 text-center dark:from-blue-950/20 dark:to-purple-950/20">
          <h2 className="text-2xl font-bold">
            Pronto para transformar seu negócio?
          </h2>
          <p className="text-muted-foreground">
            Comece seu teste gratuito hoje mesmo e veja a diferença.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/auth">
                Começar Teste Grátis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#contato">Falar com Vendas</Link>
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default DemoPage;
