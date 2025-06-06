import { z } from "zod";

export const updateSettingsSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phoneNumber: z.string().optional(),
  clinicName: z.string().min(1, "Nome da clínica é obrigatório"),
  language: z.string(),
  timezone: z.string(),
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  appointmentReminders: z.boolean(),
  marketingEmails: z.boolean(),
});

export type UpdateSettingsSchema = z.infer<typeof updateSettingsSchema>;
