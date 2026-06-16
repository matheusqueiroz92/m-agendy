import { z } from "zod";

export const upsertFollowUpSchema = z.object({
  id: z.string().uuid().optional(),
  patientId: z.string().uuid(),
  title: z.string().trim().min(1, {
    message: "O título do acompanhamento é obrigatório.",
  }),
  description: z.string().trim().optional(),
  status: z
    .enum(["pending", "in_progress", "completed", "cancelled"])
    .default("pending"),
  scheduledDate: z.date().optional(),
  completedDate: z.date().optional(),
});

export type UpsertFollowUpSchema = z.infer<typeof upsertFollowUpSchema>;
