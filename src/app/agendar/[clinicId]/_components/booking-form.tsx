"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import { bookAppointment } from "@/actions/book-appointment";
import { getAvailableTimeSlotsPublic } from "@/actions/get-available-time-slots-public";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
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
import { formatCurrencyInCents } from "@/helpers/currency";

interface Professional {
  id: string;
  name: string;
  speciality: string;
  appointmentPriceInCents: number;
  availableFromWeekDay: number;
  availableToWeekDay: number;
  availableFromTime: string;
  availableToTime: string;
}

interface BookingFormProps {
  clinicId: string;
  professionals: Professional[];
  professionalLabel: string;
}

const formSchema = z.object({
  doctorId: z.string().uuid({ message: "Selecione um profissional." }),
  date: z.date({ message: "Selecione uma data." }),
  time: z.string().min(1, { message: "Selecione um horário." }),
  patientName: z.string().trim().min(1, { message: "Informe seu nome." }),
  patientEmail: z.string().trim().email({ message: "E-mail inválido." }),
  patientPhoneNumber: z
    .string()
    .trim()
    .min(10, { message: "Informe seu telefone." }),
  patientSex: z.enum(["male", "female"], { message: "Selecione o sexo." }),
});

type FormValues = z.infer<typeof formSchema>;

const toISODate = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const BookingForm = ({
  clinicId,
  professionals,
  professionalLabel,
}: BookingFormProps) => {
  const professionalLower = professionalLabel.toLowerCase();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      doctorId: "",
      time: "",
      patientName: "",
      patientEmail: "",
      patientPhoneNumber: "",
    } as Partial<FormValues> as FormValues,
  });

  const selectedDoctorId = form.watch("doctorId");
  const watchedDate = form.watch("date");

  const selectedProfessional = useMemo(
    () => professionals.find((p) => p.id === selectedDoctorId),
    [professionals, selectedDoctorId],
  );

  const slotsAction = useAction(getAvailableTimeSlotsPublic);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Busca os horários livres ao escolher profissional + data.
  useEffect(() => {
    if (!selectedDoctorId || !watchedDate) {
      setAvailableTimes([]);
      return;
    }
    let cancelled = false;
    setIsLoadingSlots(true);
    slotsAction
      .executeAsync({
        clinicId,
        doctorId: selectedDoctorId,
        date: toISODate(watchedDate),
      })
      .then((result) => {
        if (cancelled) return;
        const slots = result?.data?.timeSlots ?? [];
        setAvailableTimes(slots.filter((s) => s.available).map((s) => s.time));
      })
      .catch(() => {
        if (!cancelled) setAvailableTimes([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
    // slotsAction é estável o suficiente; recalcula por profissional/data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDoctorId, watchedDate, clinicId]);

  const bookAction = useAction(bookAppointment, {
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Não foi possível agendar.");
    },
  });

  const onSubmit = (values: FormValues) => {
    bookAction.execute({ clinicId, ...values });
  };

  if (bookAction.result.data?.appointmentId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          <h2 className="text-lg font-semibold">Agendamento confirmado!</h2>
          <p className="text-muted-foreground text-sm">
            Você receberá a confirmação e os lembretes pelo WhatsApp informado.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (professionals.length === 0) {
    return (
      <Card>
        <CardContent className="text-muted-foreground py-10 text-center text-sm">
          Esta clínica ainda não tem profissionais disponíveis para
          agendamento.
        </CardContent>
      </Card>
    );
  }

  const isPending = bookAction.isPending;
  const timePlaceholder = !watchedDate
    ? "Escolha a data primeiro"
    : isLoadingSlots
      ? "Carregando..."
      : availableTimes.length === 0
        ? "Sem horários livres"
        : "Selecione o horário";

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="doctorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{professionalLabel}</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("time", "");
                    }}
                    value={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={`Selecione o ${professionalLower}`}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {professionals.map((professional) => (
                        <SelectItem key={professional.id} value={professional.id}>
                          {professional.name} · {professional.speciality}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedProfessional && (
              <p className="text-muted-foreground text-sm">
                Valor da consulta:{" "}
                {formatCurrencyInCents(
                  selectedProfessional.appointmentPriceInCents,
                )}
              </p>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          form.setValue("time", "");
                        }}
                        disabled={!selectedProfessional || isPending}
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
                      disabled={
                        !watchedDate || isLoadingSlots || isPending
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={timePlaceholder} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableTimes.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="patientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seu nome</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="patientEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="patientPhoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone (WhatsApp)</FormLabel>
                    <FormControl>
                      <PatternFormat
                        format="(##) #####-####"
                        mask="_"
                        customInput={Input}
                        placeholder="(00) 00000-0000"
                        value={field.value}
                        onValueChange={(values) => field.onChange(values.value)}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="patientSex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sexo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o sexo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Feminino</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Agendando..." : "Confirmar agendamento"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
