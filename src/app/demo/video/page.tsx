"use client";

import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Play,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";

const VideoPage = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const videoFeatures = [
    {
      time: "0:30",
      title: "Dashboard Analytics",
      description: "Visualize métricas em tempo real",
      icon: BarChart3,
    },
    {
      time: "1:15",
      title: "Gestão de Agendamentos",
      description: "Sistema inteligente de prevenção de conflitos",
      icon: Calendar,
    },
    {
      time: "2:00",
      title: "Cadastro de Pacientes",
      description: "Interface intuitiva para gerenciar pacientes",
      icon: Users,
    },
    {
      time: "2:45",
      title: "Controle de Médicos",
      description: "Gerencie especialidades e disponibilidades",
      icon: Activity,
    },
  ];

  const benefits = [
    "Interface moderna e intuitiva",
    "Prevenção automática de conflitos",
    "Dashboard com analytics avançados",
    "Gestão completa de pacientes e médicos",
    "Notificações e lembretes automáticos",
    "Relatórios financeiros integrados",
  ];

  return (
    <PageContainer>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/demo" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar para Demos
            </Link>
          </Button>
          <div className="bg-border h-4 w-px" />
          <Badge variant="secondary">
            <Play className="mr-1 h-3 w-3" />
            Vídeo Demonstração
          </Badge>
        </div>

        {/* Video Section */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">Veja o M.Agendy em Ação</h1>
              <p className="text-muted-foreground text-lg">
                Descubra como nossa plataforma pode transformar a gestão de
                agendamentos do seu negócio em apenas 4 minutos.
              </p>
              <div className="text-muted-foreground flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>4:20 minutos</span>
                </div>
                <div className="flex items-center gap-1">
                  <Play className="h-4 w-4" />
                  <span>HD Quality</span>
                </div>
              </div>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-900">
              {!isPlaying ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
                  <div className="space-y-4 text-center">
                    <Button
                      onClick={() => setIsPlaying(true)}
                      size="lg"
                      className="h-16 w-16 rounded-full border-white/30 bg-white/20 p-0 text-white hover:bg-white/30"
                    >
                      <Play className="h-8 w-8" />
                    </Button>
                    <div className="text-white">
                      <p className="font-semibold">M.Agendy - Demo Completa</p>
                      <p className="text-sm opacity-90">Clique para assistir</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute top-4 right-4">
                    <Badge className="border-white/30 bg-white/20 text-white">
                      4:20
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-800">
                  <div className="text-center text-white">
                    <Play className="mx-auto mb-4 h-16 w-16 opacity-50" />
                    <p className="text-lg font-semibold">Vídeo Demonstração</p>
                    <p className="text-sm opacity-75">
                      Em um ambiente real, aqui seria exibido o vídeo do
                      M.Agendy
                    </p>
                    <Button
                      onClick={() => setIsPlaying(false)}
                      variant="outline"
                      size="sm"
                      className="mt-4 border-white/30 text-white hover:bg-white/10"
                    >
                      Reset Demo
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Video Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  O que você verá no vídeo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {videoFeatures.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <div key={index} className="flex items-start gap-4">
                        <div className="flex h-8 w-12 flex-shrink-0 items-center justify-center rounded bg-blue-100 dark:bg-blue-900/30">
                          <span className="text-xs font-semibold text-blue-600">
                            {feature.time}
                          </span>
                        </div>
                        <div className="flex flex-1 items-start gap-3">
                          <div className="bg-muted flex-shrink-0 rounded-lg p-2">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-medium">{feature.title}</h4>
                            <p className="text-muted-foreground text-sm">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Principais Benefícios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Por que escolher o M.Agendy?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-blue-50 p-4 text-center dark:bg-blue-950/30">
                  <div className="text-2xl font-bold text-blue-600">50%</div>
                  <div className="text-muted-foreground text-sm">
                    Redução no tempo de agendamento
                  </div>
                </div>
                <div className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-950/30">
                  <div className="text-2xl font-bold text-green-600">30%</div>
                  <div className="text-muted-foreground text-sm">
                    Aumento na satisfação dos pacientes
                  </div>
                </div>
                <div className="rounded-lg bg-purple-50 p-4 text-center dark:bg-purple-950/30">
                  <div className="text-2xl font-bold text-purple-600">24/7</div>
                  <div className="text-muted-foreground text-sm">
                    Acesso ao sistema e suporte
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 dark:border-blue-800 dark:from-blue-950/20 dark:to-purple-950/20">
              <CardContent className="space-y-4 p-6 text-center">
                <h3 className="text-lg font-semibold">Pronto para começar?</h3>
                <p className="text-muted-foreground text-sm">
                  Teste gratuitamente por 14 dias. Sem compromisso!
                </p>
                <div className="space-y-2">
                  <Button
                    asChild
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Link href="/auth">
                      Começar Teste Grátis
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Link href="/demo/interactive">Testar Demo Interativa</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Next Steps */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="group transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="w-fit rounded-lg bg-blue-100 p-3">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Demo Interativa</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                Teste todas as funcionalidades em um ambiente real com dados
                fictícios.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/demo/interactive">Experimentar Agora</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="w-fit rounded-lg bg-green-100 p-3">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Demo Personalizada</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                Agende uma demonstração ao vivo focada nas necessidades do seu
                negócio.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/demo/schedule">Agendar Demo</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="w-fit rounded-lg bg-purple-100 p-3">
                <ArrowRight className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Começar Agora</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                Cadastre-se e comece a usar o M.Agendy hoje mesmo com teste
                grátis.
              </p>
              <Button
                asChild
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Link href="/auth">Teste Grátis</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default VideoPage;
