import { z } from "zod";

export const searchPatientsSchema = z.object({
  query: z.string().trim().max(100).optional().default(""),
  limit: z.number().int().min(1).max(50).optional().default(20),
});
