"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, TrashIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useFieldArray, useForm } from "react-hook-form";
import { NumericFormat, PatternFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import { upsertDoctor } from "@/actions/upsert-doctor";
import { Button } from "@/components/ui/button";
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
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { getClinicTypeConfig } from "@/core/modules/clinics/domain/clinic-type";
import { doctorAvailabilityWindowsTable, doctorsTable } from "@/db/schema";
import { authClient } from "@/lib/auth-client";

const WEEK_DAYS = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
] as const;

const TIME_OPTIONS = Array.from({ length: (23 - 5) * 4 + 4 }, (_, i) => {
  const total = 5 * 60 + i * 15;
  const h = Math.floor(total / 60);
  const m = total % 60;
  const label = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  return { value: `${label}:00`, label };
});

const formSchema = z
  .object({
    name: z.string().trim().min(1, { message: "Nome é obrigatório." }),
    phoneNumber: z.string().trim().optional(),
    speciality: z.string().trim().min(1, {
      message: "Especialidade é obrigatória.",
    }),
    avatarImageUrl: z.string().optional(),
    appointmentPriceInCents: z
      .number({
        required_error: "Preço da consulta é obrigatório.",
        invalid_type_error: "Preço da consulta é obrigatório.",
      })
      .min(1, {
        message: "Preço da consulta é obrigatório.",
      }),
    defaultAppointmentDurationInMinutes: z.string().min(1, {
      message: "Duração padrão é obrigatória.",
    }),
    days: z.array(
      z.object({
        weekDay: z.number(),
        enabled: z.boolean(),
        intervals: z.array(
          z.object({
            startTime: z.string().min(1),
            endTime: z.string().min(1),
          }),
        ),
      }),
    ),
  })
  .superRefine((data, ctx) => {
    let hasEnabled = false;
    data.days.forEach((day, dayIndex) => {
      if (!day.enabled) return;
      hasEnabled = true;
      if (day.intervals.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Adicione ao menos um intervalo.",
          path: ["days", dayIndex, "intervals"],
        });
      }
      day.intervals.forEach((interval, intervalIndex) => {
        if (interval.startTime >= interval.endTime) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Início deve ser anterior ao término.",
            path: ["days", dayIndex, "intervals", intervalIndex, "endTime"],
          });
        }
      });
    });
    if (!hasEnabled) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ative ao menos um dia de atendimento.",
        path: ["days"],
      });
    }
  });

type DoctorWithWindows = typeof doctorsTable.$inferSelect & {
  availabilityWindows?: (typeof doctorAvailabilityWindowsTable.$inferSelect)[];
};

interface UpsertDoctorFormProps {
  doctor?: DoctorWithWindows;
  onSuccess?: () => void;
}

const defaultDays = () =>
  WEEK_DAYS.map((day) => ({
    weekDay: day.value,
    enabled: day.value >= 1 && day.value <= 5,
    intervals:
      day.value >= 1 && day.value <= 5
        ? [{ startTime: "08:00:00", endTime: "18:00:00" }]
        : [],
  }));

const daysFromDoctor = (doctor?: DoctorWithWindows) => {
  if (!doctor?.availabilityWindows?.length) {
    return defaultDays();
  }

  return WEEK_DAYS.map((day) => {
    const windows = doctor.availabilityWindows!.filter(
      (w) => w.weekDay === day.value,
    );
    return {
      weekDay: day.value,
      enabled: windows.length > 0,
      intervals:
        windows.length > 0
          ? windows.map((w) => ({
              startTime: w.startTime.length === 5 ? `${w.startTime}:00` : w.startTime,
              endTime: w.endTime.length === 5 ? `${w.endTime}:00` : w.endTime,
            }))
          : [],
    };
  });
};

export const UpsertDoctorForm = ({
  doctor,
  onSuccess,
}: UpsertDoctorFormProps) => {
  const { data: session } = authClient.useSession();
  const config = getClinicTypeConfig(session?.user?.clinic?.type);
  const singular = config.professionalSingular;
  const singularLower = singular.toLowerCase();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: doctor?.name ?? "",
      phoneNumber: doctor?.phoneNumber ?? "",
      speciality: doctor?.speciality ?? "",
      avatarImageUrl: doctor?.avatarImageUrl ?? "",
      appointmentPriceInCents: doctor?.appointmentPriceInCents
        ? doctor.appointmentPriceInCents / 100
        : undefined,
      defaultAppointmentDurationInMinutes: String(
        doctor?.defaultAppointmentDurationInMinutes ?? 30,
      ),
      days: daysFromDoctor(doctor),
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "days",
  });

  const upsertDoctorAction = useAction(upsertDoctor, {
    onSuccess: () => {
      toast.success(
        `${singular} ${doctor ? "atualizado" : "adicionado"} com sucesso.`,
      );
      onSuccess?.();
    },
    onError: ({ error }) => {
      toast.error(
        error.serverError ?? `Erro ao salvar ${singularLower}.`,
      );
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const availabilityWindows = values.days
      .filter((day) => day.enabled)
      .flatMap((day) =>
        (day.intervals ?? []).map((interval) => ({
          weekDay: day.weekDay,
          startTime: interval.startTime,
          endTime: interval.endTime,
        })),
      );

    if (availabilityWindows.length === 0) {
      toast.error("Ative ao menos um dia de atendimento.");
      return;
    }

    upsertDoctorAction.execute({
      id: doctor?.id,
      name: values.name,
      speciality: values.speciality,
      appointmentPriceInCents: Math.round(values.appointmentPriceInCents * 100),
      avatarImageUrl: values.avatarImageUrl || undefined,
      phoneNumber: values.phoneNumber || undefined,
      defaultAppointmentDurationInMinutes: parseInt(
        values.defaultAppointmentDurationInMinutes,
        10,
      ),
      availabilityWindows,
    });
  };

  const onInvalid = () => {
    toast.error("Verifique os campos obrigatórios do formulário.");
  };

  return (
    <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {doctor ? doctor.name : `Adicionar ${singularLower}`}
        </DialogTitle>
        <DialogDescription>
          {doctor
            ? `Edite as informações desse ${singularLower}.`
            : `Adicione um novo ${singularLower}.`}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="avatarImageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Foto do {singularLower}</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    disabled={upsertDoctorAction.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    disabled={upsertDoctorAction.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="speciality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Especialidade</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    list="speciality-suggestions"
                    placeholder="Digite ou selecione a especialidade"
                    disabled={upsertDoctorAction.isPending}
                  />
                </FormControl>
                {config.specialties.length > 0 && (
                  <datalist id="speciality-suggestions">
                    {config.specialties.map((speciality) => (
                      <option key={speciality} value={speciality} />
                    ))}
                  </datalist>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="appointmentPriceInCents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço da consulta</FormLabel>
                  <FormControl>
                    <NumericFormat
                      value={field.value ?? ""}
                      onValueChange={(value) => {
                        field.onChange(value.floatValue);
                      }}
                      decimalScale={2}
                      fixedDecimalScale
                      decimalSeparator=","
                      allowNegative={false}
                      allowLeadingZeros={false}
                      thousandSeparator="."
                      customInput={Input}
                      prefix="R$ "
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="defaultAppointmentDurationInMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duração padrão</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Duração" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[15, 30, 45, 60, 90, 120].map((minutes) => (
                        <SelectItem key={minutes} value={String(minutes)}>
                          {minutes} min
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-3">
            <FormLabel>Horários de atendimento</FormLabel>
            {fields.map((dayField, dayIndex) => {
              const dayMeta = WEEK_DAYS[dayIndex];
              const enabled = form.watch(`days.${dayIndex}.enabled`);
              const intervals =
                form.watch(`days.${dayIndex}.intervals`) ?? [];

              return (
                <div
                  key={dayField.id}
                  className="rounded-lg border p-3 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">{dayMeta.label}</span>
                    <FormField
                      control={form.control}
                      name={`days.${dayIndex}.enabled`}
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormLabel className="text-muted-foreground text-xs font-normal">
                            Atende
                          </FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                if (
                                  checked &&
                                  form.getValues(`days.${dayIndex}.intervals`)
                                    .length === 0
                                ) {
                                  form.setValue(
                                    `days.${dayIndex}.intervals`,
                                    [
                                      {
                                        startTime: "08:00:00",
                                        endTime: "18:00:00",
                                      },
                                    ],
                                  );
                                }
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {enabled && (
                    <div className="space-y-2">
                      {intervals.map((_, intervalIndex) => (
                        <div
                          key={intervalIndex}
                          className="grid grid-cols-[1fr_1fr_auto] gap-2"
                        >
                          <FormField
                            control={form.control}
                            name={`days.${dayIndex}.intervals.${intervalIndex}.startTime`}
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Início" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {TIME_OPTIONS.map((option) => (
                                      <SelectItem
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.label}
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
                            name={`days.${dayIndex}.intervals.${intervalIndex}.endTime`}
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Fim" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {TIME_OPTIONS.map((option) => (
                                      <SelectItem
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={intervals.length <= 1}
                            onClick={() => {
                              const next = intervals.filter(
                                (_, i) => i !== intervalIndex,
                              );
                              form.setValue(
                                `days.${dayIndex}.intervals`,
                                next,
                              );
                            }}
                          >
                            <TrashIcon className="size-4" />
                          </Button>
                        </div>
                      ))}
                      {form.formState.errors.days?.[dayIndex]?.intervals
                        ?.message && (
                        <p className="text-destructive text-sm">
                          {
                            form.formState.errors.days[dayIndex]?.intervals
                              ?.message as string
                          }
                        </p>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          form.setValue(`days.${dayIndex}.intervals`, [
                            ...intervals,
                            {
                              startTime: "14:00:00",
                              endTime: "18:00:00",
                            },
                          ]);
                        }}
                      >
                        <PlusIcon className="mr-1 size-4" />
                        Intervalo
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
            {form.formState.errors.days?.message ||
            form.formState.errors.days?.root?.message ? (
              <p className="text-destructive text-sm">
                {(form.formState.errors.days?.message ??
                  form.formState.errors.days?.root?.message) as string}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={upsertDoctorAction.isPending}>
              {upsertDoctorAction.isPending
                ? "Salvando..."
                : doctor
                  ? "Salvar"
                  : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};
