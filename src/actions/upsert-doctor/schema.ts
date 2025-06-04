import { z } from "zod";

export const upsertDoctorSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().trim().min(1, {
      message: "Nome do médico é obrigatório.",
    }),
    phoneNumber: z.string().trim().optional(),
    speciality: z.string().trim().min(1, {
      message: "Especialidade é obrigatória.",
    }),
    avatarImageUrl: z.string().optional(),
    appointmentPriceInCents: z.number().min(1, {
      message: "Preço da consulta é obrigatório.",
    }),
    availableFromWeekDay: z.number().min(0).max(6, {
      message: "Dia da semana inválido.",
    }),
    availableToWeekDay: z.number().min(0).max(6, {
      message: "Dia da semana inválido.",
    }),
    availableFromTime: z.string().min(1, {
      message: "Hora de início é obrigatória.",
    }),
    availableToTime: z.string().min(1, {
      message: "Hora de término é obrigatória.",
    }),
  })
  .refine(
    (data) => {
      return data.availableFromTime < data.availableToTime;
    },
    {
      message:
        "O horário de início não pode ser anterior ao horário de término.",
      path: ["availableToTime"],
    },
  );

export type UpsertDoctorSchema = z.infer<typeof upsertDoctorSchema>;
