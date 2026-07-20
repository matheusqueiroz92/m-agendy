import { z } from "zod";

const availabilityWindowSchema = z.object({
  weekDay: z.number().int().min(0).max(6, {
    message: "Dia da semana inválido.",
  }),
  startTime: z.string().min(1, {
    message: "Hora de início é obrigatória.",
  }),
  endTime: z.string().min(1, {
    message: "Hora de término é obrigatória.",
  }),
});

export const upsertDoctorSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().trim().min(1, {
      message: "Nome do profissional é obrigatório.",
    }),
    phoneNumber: z.string().trim().optional(),
    speciality: z.string().trim().min(1, {
      message: "Especialidade é obrigatória.",
    }),
    avatarImageUrl: z.string().optional(),
    appointmentPriceInCents: z.number().min(1, {
      message: "Preço da consulta é obrigatório.",
    }),
    defaultAppointmentDurationInMinutes: z
      .number()
      .int()
      .min(15)
      .refine((n) => n % 15 === 0, {
        message: "A duração deve ser múltiplo de 15 minutos.",
      }),
    availabilityWindows: z
      .array(availabilityWindowSchema)
      .min(1, { message: "Informe ao menos um horário de atendimento." }),
  })
  .superRefine((data, ctx) => {
    for (const [index, window] of data.availabilityWindows.entries()) {
      if (window.startTime >= window.endTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "O horário de início não pode ser posterior ao horário de término.",
          path: ["availabilityWindows", index, "endTime"],
        });
      }
    }
  });

export type UpsertDoctorSchema = z.infer<typeof upsertDoctorSchema>;
