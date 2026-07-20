import { z } from "zod";

const durationSchema = z
  .number()
  .int()
  .min(15)
  .refine((n) => n % 15 === 0, {
    message: "A duração deve ser múltiplo de 15 minutos.",
  });

export const upsertAppointmentSchema = z.object({
  id: z.string().uuid().optional(),
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  appointmentPriceInCents: z.number().positive(),
  date: z.date(),
  time: z.string().min(1),
  durationInMinutes: durationSchema.optional(),
  type: z.enum(["consultation", "return_visit"]).default("consultation"),
});

export const rescheduleAppointmentSchema = z.object({
  id: z.string().uuid(),
  date: z.date(),
  time: z.string().min(1),
  durationInMinutes: durationSchema,
});
