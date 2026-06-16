import { z } from "zod";

export const upsertPrescriptionSchema = z.object({
  id: z.string().uuid().optional(),
  patientId: z.string().uuid(),
  doctorId: z.string().uuid().optional(),
  attendanceId: z.string().uuid().optional(),
  medication: z.string().trim().min(1, {
    message: "O medicamento é obrigatório.",
  }),
  dosage: z.string().trim().optional(),
  frequency: z.string().trim().optional(),
  duration: z.string().trim().optional(),
  instructions: z.string().trim().optional(),
  date: z.date(),
});

export type UpsertPrescriptionSchema = z.infer<typeof upsertPrescriptionSchema>;
