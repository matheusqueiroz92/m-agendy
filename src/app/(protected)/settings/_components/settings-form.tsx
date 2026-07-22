"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Bell, Globe, MessageCircle, Shield, User } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import { requestWhatsAppIntegration } from "@/actions/request-whatsapp-integration";
import { updateSettings } from "@/actions/update-settings";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ChangePasswordCard } from "./change-password-card";

// Schema de validação para o formulário de configurações
const settingsSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phoneNumber: z.string().optional(),
  clinicName: z.string().min(1, "Nome da clínica é obrigatório"),
  appointmentReminders: z.boolean(),
  marketingEmails: z.boolean(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    clinic?: {
      id: string;
      name: string;
    };
  };
  canManageClinic?: boolean;
  clinicWhatsappPhoneNumberId?: string;
  /** Plano da clínica libera integrar o próprio número (Premium/Gold). */
  canUseOwnWhatsAppNumber?: boolean;
  /** Já existe uma solicitação de integração pendente (aguardando a equipe). */
  hasPendingWhatsAppRequest?: boolean;
  /** Estado real (persistido) do toggle "Lembretes de Agendamento". */
  appointmentRemindersEnabled?: boolean;
  /** Estado real (persistido) do opt-in de e-mails de marketing. */
  marketingEmailsOptIn?: boolean;
}

export const SettingsForm = ({
  user,
  canManageClinic = false,
  clinicWhatsappPhoneNumberId = "",
  canUseOwnWhatsAppNumber = false,
  hasPendingWhatsAppRequest = false,
  appointmentRemindersEnabled = true,
  marketingEmailsOptIn = false,
}: SettingsFormProps) => {
  const updateSettingsAction = useAction(updateSettings, {
    onSuccess: () => {
      toast.success("Configurações atualizadas com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar configurações:", error);
      toast.error("Erro ao atualizar configurações");
    },
  });

  const requestWhatsAppIntegrationAction = useAction(
    requestWhatsAppIntegration,
    {
      onSuccess: () => {
        toast.success(
          "Solicitação enviada! Nossa equipe vai configurar e avisar por aqui.",
        );
      },
      onError: ({ error }) => {
        toast.error(
          error.serverError ?? "Não foi possível enviar a solicitação.",
        );
      },
    },
  );

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: user.name || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      clinicName: user.clinic?.name || "",
      appointmentReminders: appointmentRemindersEnabled,
      marketingEmails: marketingEmailsOptIn,
    },
  });

  const onSubmit = async (data: SettingsFormData) => {
    updateSettingsAction.execute(data);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Conta
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Preferências
          </TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Aba Conta */}
            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informações Pessoais
                  </CardTitle>
                  <CardDescription>
                    Atualize suas informações pessoais e de contato.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone (opcional)</FormLabel>
                        <FormControl>
                          <PatternFormat
                            format="(##) #####-####"
                            mask="_"
                            customInput={Input}
                            placeholder="(00) 00000-0000"
                            value={field.value}
                            onValueChange={(values) => {
                              field.onChange(values.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Informações da Clínica</CardTitle>
                  <CardDescription>
                    Configure as informações da sua clínica.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="clinicName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Clínica</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {canManageClinic && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Integração WhatsApp
                    </CardTitle>
                    <CardDescription>
                      Por padrão, as mensagens de WhatsApp para os pacientes
                      (confirmações, lembretes) saem com o nome e número do
                      M.Agendy, não da sua clínica. Para usar o número da sua
                      clínica, é preciso solicitar a integração.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!canUseOwnWhatsAppNumber ? (
                      <div className="bg-muted/40 space-y-2 rounded-lg border border-dashed p-4">
                        <p className="text-sm font-medium">
                          Número próprio da clínica
                        </p>
                        <p className="text-muted-foreground text-sm">
                          Disponível nos planos Premium e Gold. Faça upgrade
                          para que as mensagens saiam com o nome e número da
                          sua clínica.
                        </p>
                        <Button asChild size="sm" variant="outline" type="button">
                          <Link href="/subscription">Ver planos</Link>
                        </Button>
                      </div>
                    ) : clinicWhatsappPhoneNumberId ? (
                      <div className="space-y-2">
                        <Badge variant="secondary">Número próprio ativo</Badge>
                        <p className="text-muted-foreground text-sm">
                          phone_number_id:{" "}
                          <span className="font-mono">
                            {clinicWhatsappPhoneNumberId}
                          </span>
                        </p>
                      </div>
                    ) : hasPendingWhatsAppRequest ? (
                      <div className="space-y-2">
                        <Badge variant="outline">
                          Solicitação em andamento
                        </Badge>
                        <p className="text-muted-foreground text-sm">
                          Nossa equipe está configurando a integração no Meta
                          Business Manager. Você será avisado por aqui assim
                          que estiver pronta.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-muted-foreground text-sm">
                          Solicite a integração do número de WhatsApp da sua
                          clínica — nossa equipe configura no Meta Business
                          Manager e ativa para você.
                        </p>
                        <Button
                          type="button"
                          disabled={requestWhatsAppIntegrationAction.isPending}
                          onClick={() =>
                            user.clinic?.id &&
                            requestWhatsAppIntegrationAction.execute({
                              clinicId: user.clinic.id,
                            })
                          }
                        >
                          {requestWhatsAppIntegrationAction.isPending
                            ? "Enviando..."
                            : "Solicitar integração"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Aba Notificações */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Configurações de Notificação
                  </CardTitle>
                  <CardDescription>
                    Escolha como você quer ser notificado sobre eventos
                    importantes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="appointmentReminders"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Lembretes de Agendamento</FormLabel>
                          <FormDescription>
                            Enviar lembretes automáticos para pacientes
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <FormField
                    control={form.control}
                    name="marketingEmails"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Emails de Marketing</FormLabel>
                          <FormDescription>
                            Receber novidades e promoções por email
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Segurança */}
            <TabsContent value="security" className="space-y-6">
              <ChangePasswordCard />
            </TabsContent>

            {/* Aba Preferências */}
            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Preferências Gerais
                  </CardTitle>
                  <CardDescription>
                    Configure a aparência da aplicação.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">Aparência</label>
                      <p className="text-muted-foreground text-sm">
                        Escolha entre modo claro ou escuro
                      </p>
                    </div>
                    <ThemeToggle />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Botões de ação */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateSettingsAction.isPending}>
                {updateSettingsAction.isPending
                  ? "Salvando..."
                  : "Salvar Configurações"}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
};
