import { z } from "zod";

export const upsertMedicalRecordSchema = z.object({
  patientId: z.string().uuid(),
  bloodType: z.string().trim().optional(),
  allergies: z.string().trim().optional(),
  medicationsInUse: z.string().trim().optional(),
  clinicalHistory: z.string().trim().optional(),
  surgicalHistory: z.string().trim().optional(),
  familyHistory: z.string().trim().optional(),
  habits: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type UpsertMedicalRecordSchema = z.infer<
  typeof upsertMedicalRecordSchema
>;
