"use client";

import {
  ArrowLeft,
  BarChart3,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  Headphones,
  Mail,
  MessageCircle,
  Phone,
  User,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageContainer } from "@/components/ui/page-container";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SchedulePage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    businessType: "",
    teamSize: "",
    preferredDate: "",
    preferredTime: "",
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

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simular envio do formulário
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success(
        "Demo agendada com sucesso! Nossa equipe entrará em contato em breve.",
      );

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        businessType: "",
        teamSize: "",
        preferredDate: "",
        preferredTime: "",
        message: "",
      });
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      toast.error("Erro ao agendar demo. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: User,
      title: "Consultoria Personalizada",
      description: "Demo focada nas necessidades específicas do seu negócio",
    },
    {
      icon: Clock,
      title: "Duração Flexível",
      description: "Entre 30-45 minutos, adaptável ao seu tempo disponível",
    },
    {
      icon: Headphones,
      title: "Suporte Especializado",
      description: "Tire todas as dúvidas com nossos especialistas",
    },
    {
      icon: BarChart3,
      title: "ROI Demonstrado",
      description: "Veja como o M.Agendy pode impactar seus resultados",
    },
  ];

  const processSteps = [
    {
      step: "1",
      title: "Agendamento",
      description: "Preencha o formulário com suas informações e preferências",
    },
    {
      step: "2",
      title: "Confirmação",
      description:
        "Nossa equipe entrará em contato para confirmar data e horário",
    },
    {
      step: "3",
      title: "Preparação",
      description: "Enviamos link da reunião e materiais preparatórios",
    },
    {
      step: "4",
      title: "Demo ao Vivo",
      description: "Demonstração personalizada com foco no seu caso de uso",
    },
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
            <Calendar className="mr-1 h-3 w-3" />
            Demo Personalizada
          </Badge>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form Section */}
          <div className="space-y-6 lg:col-span-2">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">
                Agende sua Demo Personalizada
              </h1>
              <p className="text-muted-foreground text-lg">
                Vamos mostrar como o M.Agendy pode resolver os desafios
                específicos do seu negócio. Nossa equipe irá personalizar a
                demonstração para o seu caso de uso.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  Informações de Contato
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Nome Completo *
                      </label>
                      <div className="relative">
                        <User className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Seu nome completo"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Email Corporativo *
                      </label>
                      <div className="relative">
                        <Mail className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="seu@empresa.com"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Telefone
                      </label>
                      <div className="relative">
                        <Phone className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                        <Input
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="(11) 99999-9999"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Empresa *
                      </label>
                      <div className="relative">
                        <Building className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                        <Input
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          placeholder="Nome da sua empresa"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Tipo de Negócio *
                      </label>
                      <Select
                        value={formData.businessType}
                        onValueChange={(value) =>
                          handleSelectChange("businessType", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="clinica">
                            Clínica Médica
                          </SelectItem>
                          <SelectItem value="consultorio">
                            Consultório
                          </SelectItem>
                          <SelectItem value="hospital">Hospital</SelectItem>
                          <SelectItem value="autonomo">
                            Profissional Autônomo
                          </SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Tamanho da Equipe
                      </label>
                      <Select
                        value={formData.teamSize}
                        onValueChange={(value) =>
                          handleSelectChange("teamSize", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Quantas pessoas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-5">1-5 pessoas</SelectItem>
                          <SelectItem value="6-20">6-20 pessoas</SelectItem>
                          <SelectItem value="21-50">21-50 pessoas</SelectItem>
                          <SelectItem value="50+">
                            Mais de 50 pessoas
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Data Preferida
                      </label>
                      <Input
                        name="preferredDate"
                        type="date"
                        value={formData.preferredDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Horário Preferido
                      </label>
                      <Select
                        value={formData.preferredTime}
                        onValueChange={(value) =>
                          handleSelectChange("preferredTime", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o horário" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="9:00">09:00</SelectItem>
                          <SelectItem value="10:00">10:00</SelectItem>
                          <SelectItem value="11:00">11:00</SelectItem>
                          <SelectItem value="14:00">14:00</SelectItem>
                          <SelectItem value="15:00">15:00</SelectItem>
                          <SelectItem value="16:00">16:00</SelectItem>
                          <SelectItem value="17:00">17:00</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Mensagem Adicional
                    </label>
                    <div className="relative">
                      <MessageCircle className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Conte-nos sobre seus principais desafios ou o que gostaria de ver na demonstração..."
                        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-[100px] w-full rounded-md border py-2 pr-4 pl-10 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Agendando..."
                    ) : (
                      <>
                        <Calendar className="mr-2 h-4 w-4" />
                        Agendar Demo
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">O que você ganha</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => {
                    const Icon = benefit.icon;
                    return (
                      <div key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                          <Icon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">
                            {benefit.title}
                          </h4>
                          <p className="text-muted-foreground text-xs">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Process */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Como funciona</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {processSteps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                        {step.step}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">{step.title}</h4>
                        <p className="text-muted-foreground text-xs">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Guarantee */}
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:border-green-800 dark:from-green-950/20 dark:to-emerald-950/20">
              <CardContent className="space-y-4 p-6 text-center">
                <div className="mx-auto w-fit rounded-full bg-green-100 p-3 dark:bg-green-900/50">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-green-800 dark:text-green-200">
                  Garantia de Valor
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Se não identificarmos pelo menos 3 oportunidades de melhoria
                  para seu negócio, devolvemos seu tempo!
                </p>
              </CardContent>
            </Card>

            {/* Alternative Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Outras opções</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/demo/interactive">Demo Interativa</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/demo/video">Vídeo Demonstração</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/auth">Teste Grátis 14 Dias</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default SchedulePage;
