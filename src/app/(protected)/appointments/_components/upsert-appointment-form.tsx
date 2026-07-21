"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import { upsertAppointment } from "@/actions/upsert-appointment";
import { UpsertPatientForm } from "@/app/(protected)/patients/_components/upsert-patient-form";
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
import { appointmentsTable, doctorsTable } from "@/db/schema";
import { useAvailableTimeSlots } from "@/hooks/use-available-time-slots";
import { useInvalidateTimeSlots } from "@/hooks/use-invalidate-time-slots";
import { useProfessionalLabels } from "@/hooks/use-professional-labels";

import { PatientSearchCombobox } from "./patient-search-combobox";

const formSchema = z.object({
  patientId: z.string().min(1, {
    message: "Paciente é obrigatório.",
  }),
  doctorId: z.string().min(1, {
    message: "Profissional é obrigatório.",
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
  durationInMinutes: z.string().min(1, {
    message: "Duração é obrigatória.",
  }),
  type: z.enum(["consultation", "return_visit"]),
});

const APPOINTMENT_TYPE_LABEL: Record<"consultation" | "return_visit", string> = {
  consultation: "Consulta",
  return_visit: "Retorno",
};

type DoctorOption = typeof doctorsTable.$inferSelect & {
  availabilityWindows?: { weekDay: number }[];
};

type Step = "appointment" | "patient";

interface UpsertAppointmentFormProps {
  doctors: DoctorOption[];
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
  defaultValues?: {
    doctorId?: string;
    date?: Date;
    time?: string;
    durationInMinutes?: number;
  };
  onSuccess?: () => void;
}

export const UpsertAppointmentForm = ({
  doctors,
  appointment,
  defaultValues,
  onSuccess,
}: UpsertAppointmentFormProps) => {
  const [step, setStep] = useState<Step>("appointment");
  const [selectedPatientLabel, setSelectedPatientLabel] = useState(
    appointment?.patient?.name ?? "",
  );
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    appointment?.doctorId || defaultValues?.doctorId || "",
  );
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    appointment?.patientId || "",
  );

  const { invalidateTimeSlots } = useInvalidateTimeSlots();

  const form = useForm<z.infer<typeof formSchema>>({
    // Mantém valores ao trocar para o passo de cadastro de paciente (campos desmontam).
    shouldUnregister: false,
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: appointment?.patientId ?? "",
      doctorId: appointment?.doctorId ?? defaultValues?.doctorId ?? "",
      appointmentPriceInCents: appointment
        ? appointment.appointmentPriceInCents / 100
        : 0,
      date: appointment?.date
        ? new Date(appointment.date)
        : defaultValues?.date,
      time: appointment
        ? `${String(new Date(appointment.date).getHours()).padStart(2, "0")}:${String(new Date(appointment.date).getMinutes()).padStart(2, "0")}`
        : (defaultValues?.time ?? ""),
      durationInMinutes: String(
        appointment?.durationInMinutes ??
          defaultValues?.durationInMinutes ??
          30,
      ),
      type: appointment?.type ?? "consultation",
    },
  });

  const { singular: professionalLabel } = useProfessionalLabels();
  const watchedDate = form.watch("date");

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

  const handleDoctorChange = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    const doctor = doctors.find((d) => d.id === doctorId);
    if (doctor && !appointment) {
      form.setValue(
        "appointmentPriceInCents",
        doctor.appointmentPriceInCents / 100,
      );
      form.setValue(
        "durationInMinutes",
        String(doctor.defaultAppointmentDurationInMinutes ?? 30),
      );
    }
    form.setValue("doctorId", doctorId);
    form.setValue("time", "");

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

  const isDateAvailable = (date: Date) => {
    if (!selectedDoctorId) return false;

    const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);
    if (!selectedDoctor) return false;

    const dayOfWeek = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    ).getDay();

    const windows = selectedDoctor.availabilityWindows ?? [];
    return windows.some((window) => window.weekDay === dayOfWeek);
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
      appointmentPriceInCents: values.appointmentPriceInCents * 100,
      date: values.date,
      time: values.time,
      durationInMinutes: parseInt(values.durationInMinutes, 10),
      type: values.type,
    });
  };

  if (step === "patient") {
    return (
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <UpsertPatientForm
          embedded
          onCancel={() => setStep("appointment")}
          onSuccess={({ patientId, name }) => {
            handlePatientChange(patientId);
            setSelectedPatientLabel(name);
            setStep("appointment");
          }}
        />
      </DialogContent>
    );
  }

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
                <FormControl>
                  <PatientSearchCombobox
                    value={field.value}
                    selectedLabel={selectedPatientLabel}
                    onSelect={(patient) => {
                      handlePatientChange(patient.id);
                      setSelectedPatientLabel(patient.name);
                    }}
                    onCreatePatient={() => setStep("patient")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="doctorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{professionalLabel}</FormLabel>
                <Select onValueChange={handleDoctorChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={`Selecione um ${professionalLabel.toLowerCase()}`}
                      />
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
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(Object.keys(APPOINTMENT_TYPE_LABEL) as Array<
                      keyof typeof APPOINTMENT_TYPE_LABEL
                    >).map((type) => (
                      <SelectItem key={type} value={type}>
                        {APPOINTMENT_TYPE_LABEL[type]}
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

          <FormField
            control={form.control}
            name="durationInMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duração</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Duração" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[15, 30, 45, 60, 90, 120].map((minutes) => (
                      <SelectItem key={minutes} value={String(minutes)}>
                        {minutes} minutos
                      </SelectItem>
                    ))}
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
