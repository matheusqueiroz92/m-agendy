import { z } from "zod";

export const upsertDiagnosisSchema = z.object({
  id: z.string().uuid().optional(),
  patientId: z.string().uuid(),
  attendanceId: z.string().uuid().optional(),
  description: z.string().trim().min(1, {
    message: "A descrição do diagnóstico é obrigatória.",
  }),
  cid10Code: z.string().trim().optional(),
  status: z.enum(["active", "resolved", "chronic"]).default("active"),
  date: z.date(),
  notes: z.string().trim().optional(),
});

export type UpsertDiagnosisSchema = z.infer<typeof upsertDiagnosisSchema>;
