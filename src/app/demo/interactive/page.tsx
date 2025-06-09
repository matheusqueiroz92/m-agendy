"use client";

import {
  Activity,
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Calendar,
  CalendarPlus,
  Clock,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";

// Dados fictícios para a demo
const demoData = {
  stats: {
    totalAppointments: 156,
    totalPatients: 89,
    totalDoctors: 8,
    monthlyRevenue: 45600,
  },
  recentAppointments: [
    {
      id: 1,
      patient: "Maria Silva",
      doctor: "Dr. João Santos",
      specialty: "Cardiologia",
      date: "2024-01-15",
      time: "14:30",
      status: "confirmado",
    },
    {
      id: 2,
      patient: "Pedro Oliveira",
      doctor: "Dra. Ana Costa",
      specialty: "Dermatologia",
      date: "2024-01-15",
      time: "15:00",
      status: "pendente",
    },
    {
      id: 3,
      patient: "Carlos Ferreira",
      doctor: "Dr. Lucas Martins",
      specialty: "Ortopedia",
      date: "2024-01-15",
      time: "16:00",
      status: "confirmado",
    },
  ],
  topDoctors: [
    { name: "Dr. João Santos", specialty: "Cardiologia", appointments: 28 },
    { name: "Dra. Ana Costa", specialty: "Dermatologia", appointments: 24 },
    { name: "Dr. Lucas Martins", specialty: "Ortopedia", appointments: 22 },
  ],
};

const InteractiveDemoPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [demoStep, setDemoStep] = useState(0);

  const demoSteps = [
    {
      title: "Bem-vindo ao M.Agendy!",
      description:
        "Este é um ambiente de demonstração com dados fictícios. Explore as funcionalidades livremente.",
      action: "Começar Tour",
    },
    {
      title: "Dashboard Analítico",
      description:
        "Visualize métricas importantes e tenha insights sobre seu negócio em tempo real.",
      action: "Ver Agendamentos",
    },
    {
      title: "Gestão de Agendamentos",
      description:
        "Gerencie consultas, visualize horários disponíveis e evite conflitos automaticamente.",
      action: "Explorar Mais",
    },
  ];

  const nextStep = () => {
    if (demoStep < demoSteps.length - 1) {
      setDemoStep(demoStep + 1);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Demo Header com Watermark */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-3 text-white">
        <div className="container mx-auto flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Badge
              variant="secondary"
              className="border-white/30 bg-white/20 text-white"
            >
              <Activity className="mr-1 h-3 w-3" />
              MODO DEMONSTRAÇÃO
            </Badge>
            <span className="text-sm opacity-90">
              Ambiente de teste com dados fictícios
            </span>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <Link href="/demo" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </div>

      {/* Tour Guide */}
      {demoStep < demoSteps.length && (
        <div className="border-b border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/50">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                  {demoSteps[demoStep].title}
                </h3>
                <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                  {demoSteps[demoStep].description}
                </p>
              </div>
              <Button
                onClick={nextStep}
                size="sm"
                className="bg-yellow-600 text-white hover:bg-yellow-700"
              >
                {demoSteps[demoStep].action}
              </Button>
            </div>
          </div>
        </div>
      )}

      <PageContainer>
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b">
            <nav className="flex gap-8">
              {[
                { id: "dashboard", label: "Dashboard", icon: BarChart3 },
                { id: "appointments", label: "Agendamentos", icon: Calendar },
                { id: "patients", label: "Pacientes", icon: Users },
                { id: "doctors", label: "Médicos", icon: Activity },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-600 text-blue-600"
                        : "text-muted-foreground hover:text-foreground border-transparent"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Agendamentos
                  </CardTitle>
                  <Calendar className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {demoData.stats.totalAppointments}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    <span className="text-green-600">+12%</span> em relação ao
                    mês anterior
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pacientes
                  </CardTitle>
                  <Users className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {demoData.stats.totalPatients}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    <span className="text-green-600">+8%</span> novos pacientes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Médicos</CardTitle>
                  <Activity className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {demoData.stats.totalDoctors}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Especialidades ativas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Receita Mensal
                  </CardTitle>
                  <TrendingUp className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {demoData.stats.monthlyRevenue.toLocaleString()}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    <span className="text-green-600">+15%</span> crescimento
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Appointments */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Agendamentos Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {demoData.recentAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <p className="font-medium">{appointment.patient}</p>
                        <p className="text-muted-foreground text-sm">
                          {appointment.doctor} - {appointment.specialty}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {appointment.date} às {appointment.time}
                        </p>
                      </div>
                      <Badge
                        variant={
                          appointment.status === "confirmado"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {appointment.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Médicos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {demoData.topDoctors.map((doctor, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <p className="font-medium">{doctor.name}</p>
                        <p className="text-muted-foreground text-sm">
                          {doctor.specialty}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{doctor.appointments}</p>
                        <p className="text-muted-foreground text-sm">
                          consultas
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "appointments" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                Gerenciamento de Agendamentos
              </h2>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <CalendarPlus className="mr-2 h-4 w-4" />
                Novo Agendamento
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Agendamentos do Dia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {demoData.recentAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="text-muted-foreground h-4 w-4" />
                          <span className="font-medium">
                            {appointment.time}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{appointment.patient}</p>
                          <p className="text-muted-foreground text-sm">
                            {appointment.doctor} - {appointment.specialty}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            appointment.status === "confirmado"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {appointment.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "patients" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Gestão de Pacientes</h2>
              <Button className="bg-green-600 hover:bg-green-700">
                <UserPlus className="mr-2 h-4 w-4" />
                Novo Paciente
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Lista de Pacientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    "Maria Silva",
                    "Pedro Oliveira",
                    "Carlos Ferreira",
                    "Ana Santos",
                    "João Costa",
                  ].map((name, index) => (
                    <div
                      key={index}
                      className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{name}</p>
                        <p className="text-muted-foreground text-sm">
                          Último agendamento: {new Date().toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Visualizar
                        </Button>
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "doctors" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Gestão de Médicos</h2>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <UserPlus className="mr-2 h-4 w-4" />
                Novo Médico
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {demoData.topDoctors.map((doctor, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{doctor.name}</CardTitle>
                    <p className="text-muted-foreground">{doctor.specialty}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Consultas este mês:</span>
                        <span className="font-semibold">
                          {doctor.appointments}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Status:</span>
                        <Badge variant="default">Ativo</Badge>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          Agenda
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          Editar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-12 space-y-6 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 p-8 text-center dark:from-blue-950/20 dark:to-purple-950/20">
          <h2 className="text-2xl font-bold">Gostou do que viu?</h2>
          <p className="text-muted-foreground">
            Esta é apenas uma prévia das funcionalidades do M.Agendy. Comece seu
            teste gratuito e transforme seu negócio hoje mesmo!
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/auth">Começar Teste Grátis</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/demo/schedule">Agendar Demo Personalizada</Link>
            </Button>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

export default InteractiveDemoPage;
