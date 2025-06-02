"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import { upsertAppointment } from "@/app/actions/upsert-appointment";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";
import { useAvailableTimeSlots } from "@/hooks/use-available-time-slots";
import { useInvalidateTimeSlots } from "@/hooks/use-invalidate-time-slots";

const formSchema = z.object({
  patientId: z.string().min(1, {
    message: "Paciente é obrigatório.",
  }),
  doctorId: z.string().min(1, {
    message: "Médico é obrigatório.",
  }),
  appointmentPriceInCents: z.number().min(1, {
    message: "Valor da consulta é obrigatório.",
  }),
  date: z.date({
    required_error: "Data é obrigatória.",
  }),
  time: z.string().min(1, {
    message: "Horário é obrigatório.",
  }),
});

interface UpsertAppointmentFormProps {
  doctors: (typeof doctorsTable.$inferSelect)[];
  patients: (typeof patientsTable.$inferSelect)[];
  appointment?: typeof appointmentsTable.$inferSelect & {
    patient: {
      id: string;
      name: string;
    };
    doctor: {
      id: string;
      name: string;
    };
  };
  onSuccess?: () => void;
}

const UpsertAppointmentForm = ({
  doctors,
  patients,
  appointment,
  onSuccess,
}: UpsertAppointmentFormProps) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    appointment?.doctorId || "",
  );
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    appointment?.patientId || "",
  );

  const { invalidateTimeSlots } = useInvalidateTimeSlots();

  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: appointment?.patientId || "",
      doctorId: appointment?.doctorId || "",
      appointmentPriceInCents: appointment?.appointmentPriceInCents
        ? appointment.appointmentPriceInCents / 100
        : 0,
      date: appointment?.date ? new Date(appointment.date) : undefined,
      time: appointment?.date
        ? `${new Date(appointment.date).getHours().toString().padStart(2, "0")}:${new Date(appointment.date).getMinutes().toString().padStart(2, "0")}`
        : "",
    },
  });

  const watchedDate = form.watch("date");

  // Hook para buscar horários disponíveis
  const {
    data: timeSlots = [],
    isLoading: isLoadingTimeSlots,
    error: timeSlotsError,
  } = useAvailableTimeSlots({
    doctorId: selectedDoctorId,
    date: watchedDate,
    enabled: !!selectedDoctorId && !!watchedDate,
  });

  const upsertAppointmentAction = useAction(upsertAppointment, {
    onSuccess: () => {
      toast.success(
        appointment
          ? "Agendamento atualizado com sucesso!"
          : "Agendamento criado com sucesso!",
      );

      // Invalidar cache para o médico e data do agendamento
      const formData = form.getValues();
      const { doctorId, date } = formData;
      if (date && doctorId) {
        invalidateTimeSlots(doctorId, date);
      }

      // Invalidar também todos os caches de horários para garantir consistência
      invalidateTimeSlots();

      onSuccess?.();
    },
    onError: (error) => {
      console.log(error);

      // Verificar se é erro de conflito específico
      const errorMessage = error.error.serverError;
      if (errorMessage && errorMessage.includes("Já existe um agendamento")) {
        toast.error(errorMessage);
        // Invalidar cache para atualizar horários disponíveis
        const formData = form.getValues();
        const { doctorId, date } = formData;
        if (date && doctorId) {
          invalidateTimeSlots(doctorId, date);
        }
      } else {
        toast.error(
          appointment
            ? "Erro ao atualizar agendamento."
            : "Erro ao criar agendamento.",
        );
      }
    },
  });

  // Atualiza o preço quando o médico é selecionado
  const handleDoctorChange = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    const doctor = doctors.find((d) => d.id === doctorId);
    if (doctor && !appointment) {
      // Só preenche automaticamente se não estiver editando
      form.setValue(
        "appointmentPriceInCents",
        doctor.appointmentPriceInCents / 100,
      );
    }
    form.setValue("doctorId", doctorId);

    // Limpar horário quando trocar médico
    form.setValue("time", "");

    // Invalidar cache para o novo médico
    const currentDate = form.getValues("date");
    if (currentDate) {
      invalidateTimeSlots(doctorId, currentDate);
    }
  };

  const handlePatientChange = (patientId: string) => {
    setSelectedPatientId(patientId);
    form.setValue("patientId", patientId);
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      form.setValue("date", date);
    } else {
      form.resetField("date");
    }
    // Limpar horário quando trocar data
    form.setValue("time", "");

    // Invalidar cache para a nova data
    if (date && selectedDoctorId) {
      invalidateTimeSlots(selectedDoctorId, date);
    }
  };

  // Função para verificar se uma data está disponível para o médico selecionado
  const isDateAvailable = (date: Date) => {
    if (!selectedDoctorId) return false;

    const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);
    if (!selectedDoctor) return false;

    // CORREÇÃO: usar data local para calcular o dia da semana sem problemas de timezone
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const localDate = new Date(year, month, day);
    const dayOfWeek = localDate.getDay(); // 0 = domingo, 1 = segunda, etc.

    // Verifica se o dia da semana está dentro do range de disponibilidade do médico
    const { availableFromWeekDay, availableToWeekDay } = selectedDoctor;

    let isAvailable = false;
    if (availableFromWeekDay <= availableToWeekDay) {
      // Range normal (ex: segunda a sexta = 1 a 5)
      isAvailable =
        dayOfWeek >= availableFromWeekDay && dayOfWeek <= availableToWeekDay;
    } else {
      // Range que cruza a semana (ex: sexta a segunda = 5 a 1)
      isAvailable =
        dayOfWeek >= availableFromWeekDay || dayOfWeek <= availableToWeekDay;
    }

    return isAvailable;
  };

  // Condições para habilitar campos
  const isDateEnabled = selectedPatientId && selectedDoctorId;
  const isTimeEnabled = selectedPatientId && selectedDoctorId && watchedDate;
  const isPriceEnabled = selectedDoctorId;

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    upsertAppointmentAction.execute({
      id: appointment?.id,
      patientId: values.patientId,
      doctorId: values.doctorId,
      appointmentPriceInCents: values.appointmentPriceInCents * 100, // Converte para centavos
      date: values.date,
      time: values.time,
    });
  };

  return (
    <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {appointment ? "Editar agendamento" : "Novo agendamento"}
        </DialogTitle>
        <DialogDescription>
          {appointment
            ? "Edite as informações do agendamento."
            : "Agende uma nova consulta para um paciente."}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paciente</FormLabel>
                <Select onValueChange={handlePatientChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um paciente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="doctorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Médico</FormLabel>
                <Select onValueChange={handleDoctorChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um médico" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.speciality}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="appointmentPriceInCents"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor da consulta</FormLabel>
                <FormControl>
                  <NumericFormat
                    customInput={Input}
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    decimalScale={2}
                    fixedDecimalScale
                    disabled={!isPriceEnabled}
                    value={field.value}
                    onValueChange={(values) => {
                      field.onChange(values.floatValue || 0);
                    }}
                    placeholder="R$ 0,00"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data</FormLabel>
                <FormControl>
                  <DatePicker
                    date={field.value}
                    onSelect={handleDateChange}
                    disabled={
                      !isDateEnabled
                        ? true
                        : (date: Date) => {
                            // Desabilita datas passadas
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            if (date < today) return true;

                            // Desabilita dias que o médico não atende
                            return !isDateAvailable(date);
                          }
                    }
                    placeholder="Selecione uma data"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!isTimeEnabled}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          isLoadingTimeSlots
                            ? "Carregando horários..."
                            : "Selecione um horário"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingTimeSlots ? (
                      <div className="text-muted-foreground p-2 text-center text-sm">
                        Carregando horários...
                      </div>
                    ) : timeSlotsError ? (
                      <div className="text-muted-foreground p-2 text-center text-sm">
                        Erro ao carregar horários
                      </div>
                    ) : timeSlots.length === 0 ? (
                      <div className="text-muted-foreground p-2 text-center text-sm">
                        Nenhum horário disponível
                      </div>
                    ) : (
                      timeSlots.map((timeSlot) => (
                        <SelectItem
                          key={timeSlot.time}
                          value={timeSlot.time}
                          disabled={!timeSlot.available}
                          className={
                            !timeSlot.available ? "text-muted-foreground" : ""
                          }
                        >
                          {timeSlot.time}
                          {!timeSlot.available && (
                            <span className="text-muted-foreground ml-2 text-xs">
                              indisponível
                            </span>
                          )}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={upsertAppointmentAction.isPending}
            >
              {upsertAppointmentAction.isPending
                ? appointment
                  ? "Atualizando..."
                  : "Agendando..."
                : appointment
                  ? "Atualizar agendamento"
                  : "Agendar consulta"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertAppointmentForm;
