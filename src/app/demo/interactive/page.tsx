"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Calendar,
  CalendarIcon,
  CalendarPlus,
  Clock,
  Edit3,
  Eye,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PageContainer } from "@/components/ui/page-container";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Textarea não está disponível no projeto

// Schemas de validação
const appointmentSchema = z.object({
  patientName: z.string().min(2, "Nome do paciente é obrigatório"),
  doctorId: z.string().min(1, "Selecione um médico"),
  date: z.string().min(1, "Data é obrigatória"),
  time: z.string().min(1, "Horário é obrigatório"),
  specialty: z.string().min(1, "Especialidade é obrigatória"),
  notes: z.string().optional(),
});

const patientSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone é obrigatório"),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  address: z.string().min(5, "Endereço é obrigatório"),
});

const doctorSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  specialty: z.string().min(1, "Especialidade é obrigatória"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone é obrigatório"),
  crm: z.string().min(4, "CRM é obrigatório"),
});

type AppointmentForm = z.infer<typeof appointmentSchema>;
type PatientForm = z.infer<typeof patientSchema>;
type DoctorForm = z.infer<typeof doctorSchema>;

// Tipos para os dados demo
type Appointment = {
  id: number;
  patient: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  status: string;
};

type Patient = {
  id: number;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  address: string;
};

type Doctor = {
  id: number;
  name: string;
  specialty: string;
  appointments: number;
  email: string;
  phone: string;
  crm: string;
};

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
    {
      id: 1,
      name: "Dr. João Santos",
      specialty: "Cardiologia",
      appointments: 28,
      email: "joao@example.com",
      phone: "(11) 99999-9999",
      crm: "123456",
    },
    {
      id: 2,
      name: "Dra. Ana Costa",
      specialty: "Dermatologia",
      appointments: 24,
      email: "ana@example.com",
      phone: "(11) 98888-8888",
      crm: "234567",
    },
    {
      id: 3,
      name: "Dr. Lucas Martins",
      specialty: "Ortopedia",
      appointments: 22,
      email: "lucas@example.com",
      phone: "(11) 97777-7777",
      crm: "345678",
    },
  ],
  patients: [
    {
      id: 1,
      name: "Maria Silva",
      email: "maria@example.com",
      phone: "(11) 96666-6666",
      birthDate: "1985-03-15",
      address: "Rua A, 123",
    },
    {
      id: 2,
      name: "Pedro Oliveira",
      email: "pedro@example.com",
      phone: "(11) 95555-5555",
      birthDate: "1990-07-22",
      address: "Rua B, 456",
    },
    {
      id: 3,
      name: "Carlos Ferreira",
      email: "carlos@example.com",
      phone: "(11) 94444-4444",
      birthDate: "1978-11-08",
      address: "Rua C, 789",
    },
    {
      id: 4,
      name: "Ana Santos",
      email: "ana.santos@example.com",
      phone: "(11) 93333-3333",
      birthDate: "1992-05-30",
      address: "Rua D, 101",
    },
    {
      id: 5,
      name: "João Costa",
      email: "joao.costa@example.com",
      phone: "(11) 92222-2222",
      birthDate: "1988-12-12",
      address: "Rua E, 202",
    },
  ],
};

const InteractiveDemoPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [demoStep, setDemoStep] = useState(0);

  // Estados dos modais
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [isViewPatientModalOpen, setIsViewPatientModalOpen] = useState(false);

  // Estados para edição
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);

  // Formulários
  const appointmentForm = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientName: "",
      doctorId: "",
      date: "",
      time: "",
      specialty: "",
      notes: "",
    },
  });

  const patientForm = useForm<PatientForm>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      birthDate: "",
      address: "",
    },
  });

  const doctorForm = useForm<DoctorForm>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: "",
      specialty: "",
      email: "",
      phone: "",
      crm: "",
    },
  });

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

  // Handlers para os formulários
  const onSubmitAppointment = (data: AppointmentForm) => {
    console.log("Agendamento:", data);
    toast.success(
      editingAppointment
        ? "Agendamento atualizado com sucesso!"
        : "Agendamento criado com sucesso!",
    );
    setIsAppointmentModalOpen(false);
    setEditingAppointment(null);
    appointmentForm.reset();
  };

  const onSubmitPatient = (data: PatientForm) => {
    console.log("Paciente:", data);
    toast.success(
      editingPatient
        ? "Paciente atualizado com sucesso!"
        : "Paciente criado com sucesso!",
    );
    setIsPatientModalOpen(false);
    setEditingPatient(null);
    patientForm.reset();
  };

  const onSubmitDoctor = (data: DoctorForm) => {
    console.log("Médico:", data);
    toast.success(
      editingDoctor
        ? "Médico atualizado com sucesso!"
        : "Médico criado com sucesso!",
    );
    setIsDoctorModalOpen(false);
    setEditingDoctor(null);
    doctorForm.reset();
  };

  // Handlers para edição
  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    appointmentForm.reset({
      patientName: appointment.patient,
      doctorId: appointment.doctor,
      date: appointment.date,
      time: appointment.time,
      specialty: appointment.specialty,
      notes: "",
    });
    setIsAppointmentModalOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    patientForm.reset(patient);
    setIsPatientModalOpen(true);
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    doctorForm.reset(doctor);
    setIsDoctorModalOpen(true);
  };

  const handleViewPatient = (patient: Patient) => {
    setViewingPatient(patient);
    setIsViewPatientModalOpen(true);
  };

  const handleOpenNewAppointment = () => {
    setEditingAppointment(null);
    appointmentForm.reset();
    setIsAppointmentModalOpen(true);
  };

  const handleOpenNewPatient = () => {
    setEditingPatient(null);
    patientForm.reset();
    setIsPatientModalOpen(true);
  };

  const handleOpenNewDoctor = () => {
    setEditingDoctor(null);
    doctorForm.reset();
    setIsDoctorModalOpen(true);
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
              <Button
                onClick={handleOpenNewAppointment}
                className="bg-blue-600 hover:bg-blue-700"
              >
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAppointment(appointment)}
                        >
                          <Edit3 className="h-4 w-4" />
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
              <Button
                onClick={handleOpenNewPatient}
                className="bg-green-600 hover:bg-green-700"
              >
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
                  {demoData.patients.map((patient) => (
                    <div
                      key={patient.id}
                      className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-muted-foreground text-sm">
                          Email: {patient.email}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          Telefone: {patient.phone}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewPatient(patient)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPatient(patient)}
                        >
                          <Edit3 className="h-4 w-4" />
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
              <Button
                onClick={handleOpenNewDoctor}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Novo Médico
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {demoData.topDoctors.map((doctor) => (
                <Card key={doctor.id}>
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
                        <span className="text-sm">CRM:</span>
                        <span className="font-semibold">{doctor.crm}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Status:</span>
                        <Badge variant="default">Ativo</Badge>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() =>
                            toast.info(
                              "Funcionalidade de agenda em desenvolvimento",
                            )
                          }
                        >
                          <CalendarIcon className="mr-1 h-4 w-4" />
                          Agenda
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEditDoctor(doctor)}
                        >
                          <Edit3 className="mr-1 h-4 w-4" />
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

        {/* Modal de Agendamento */}
        <Dialog
          open={isAppointmentModalOpen}
          onOpenChange={setIsAppointmentModalOpen}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingAppointment ? "Editar Agendamento" : "Novo Agendamento"}
              </DialogTitle>
              <DialogDescription>
                {editingAppointment
                  ? "Atualize as informações do agendamento."
                  : "Preencha os dados para criar um novo agendamento."}
              </DialogDescription>
            </DialogHeader>
            <Form {...appointmentForm}>
              <form
                onSubmit={appointmentForm.handleSubmit(onSubmitAppointment)}
                className="space-y-4"
              >
                <FormField
                  control={appointmentForm.control}
                  name="patientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Paciente</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite o nome do paciente"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={appointmentForm.control}
                  name="doctorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Médico</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um médico" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {demoData.topDoctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.name}>
                              {doctor.name} - {doctor.specialty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={appointmentForm.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={appointmentForm.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horário</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={appointmentForm.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Especialidade</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma especialidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Cardiologia">
                            Cardiologia
                          </SelectItem>
                          <SelectItem value="Dermatologia">
                            Dermatologia
                          </SelectItem>
                          <SelectItem value="Ortopedia">Ortopedia</SelectItem>
                          <SelectItem value="Clínica Geral">
                            Clínica Geral
                          </SelectItem>
                          <SelectItem value="Pediatria">Pediatria</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={appointmentForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Observações sobre o agendamento"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAppointmentModalOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingAppointment ? "Atualizar" : "Criar"} Agendamento
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Modal de Paciente */}
        <Dialog open={isPatientModalOpen} onOpenChange={setIsPatientModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingPatient ? "Editar Paciente" : "Novo Paciente"}
              </DialogTitle>
              <DialogDescription>
                {editingPatient
                  ? "Atualize as informações do paciente."
                  : "Preencha os dados para cadastrar um novo paciente."}
              </DialogDescription>
            </DialogHeader>
            <Form {...patientForm}>
              <form
                onSubmit={patientForm.handleSubmit(onSubmitPatient)}
                className="space-y-4"
              >
                <FormField
                  control={patientForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite o nome completo"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={patientForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="email@exemplo.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={patientForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 99999-9999" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={patientForm.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={patientForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Rua, número, bairro, cidade"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsPatientModalOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingPatient ? "Atualizar" : "Cadastrar"} Paciente
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Modal de Médico */}
        <Dialog open={isDoctorModalOpen} onOpenChange={setIsDoctorModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingDoctor ? "Editar Médico" : "Novo Médico"}
              </DialogTitle>
              <DialogDescription>
                {editingDoctor
                  ? "Atualize as informações do médico."
                  : "Preencha os dados para cadastrar um novo médico."}
              </DialogDescription>
            </DialogHeader>
            <Form {...doctorForm}>
              <form
                onSubmit={doctorForm.handleSubmit(onSubmitDoctor)}
                className="space-y-4"
              >
                <FormField
                  control={doctorForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Dr. Nome Completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={doctorForm.control}
                    name="specialty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Especialidade</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Cardiologia">
                              Cardiologia
                            </SelectItem>
                            <SelectItem value="Dermatologia">
                              Dermatologia
                            </SelectItem>
                            <SelectItem value="Ortopedia">Ortopedia</SelectItem>
                            <SelectItem value="Clínica Geral">
                              Clínica Geral
                            </SelectItem>
                            <SelectItem value="Pediatria">Pediatria</SelectItem>
                            <SelectItem value="Neurologia">
                              Neurologia
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={doctorForm.control}
                    name="crm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CRM</FormLabel>
                        <FormControl>
                          <Input placeholder="123456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={doctorForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="email@exemplo.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={doctorForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 99999-9999" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDoctorModalOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingDoctor ? "Atualizar" : "Cadastrar"} Médico
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Modal de Visualizar Paciente */}
        <Dialog
          open={isViewPatientModalOpen}
          onOpenChange={setIsViewPatientModalOpen}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Dados do Paciente</DialogTitle>
              <DialogDescription>
                Informações completas do paciente selecionado.
              </DialogDescription>
            </DialogHeader>
            {viewingPatient && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Nome
                    </label>
                    <p className="font-medium">{viewingPatient.name}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Email
                    </label>
                    <p className="font-medium">{viewingPatient.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Telefone
                    </label>
                    <p className="font-medium">{viewingPatient.phone}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Data de Nascimento
                    </label>
                    <p className="font-medium">
                      {new Date(viewingPatient.birthDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Endereço
                  </label>
                  <p className="font-medium">{viewingPatient.address}</p>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsViewPatientModalOpen(false)}
                    className="flex-1"
                  >
                    Fechar
                  </Button>
                  <Button
                    onClick={() => {
                      setIsViewPatientModalOpen(false);
                      handleEditPatient(viewingPatient);
                    }}
                    className="flex-1"
                  >
                    Editar Paciente
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

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
