import { z } from "zod";

export const upsertClinicalAttendanceSchema = z.object({
  id: z.string().uuid().optional(),
  patientId: z.string().uuid(),
  doctorId: z.string().uuid().optional(),
  appointmentId: z.string().uuid().optional(),
  date: z.date(),
  chiefComplaint: z.string().trim().optional(),
  historyOfPresentIllness: z.string().trim().optional(),
  physicalExam: z.string().trim().optional(),
  conduct: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type UpsertClinicalAttendanceSchema = z.infer<
  typeof upsertClinicalAttendanceSchema
>;
