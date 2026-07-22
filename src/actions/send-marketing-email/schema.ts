import { z } from "zod";

export const sendMarketingEmailSchema = z.object({
  subject: z.string().trim().min(1, "Informe o assunto do e-mail."),
  body: z.string().trim().min(1, "Informe o conteúdo do e-mail."),
});

export type SendMarketingEmailSchema = z.infer<typeof sendMarketingEmailSchema>;
