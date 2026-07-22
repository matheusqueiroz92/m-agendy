export interface MarketingEmailRecipient {
  email: string;
  name: string;
}

/**
 * Resolve quem pode receber e-mails de novidades/promoções do M.Agendy — só
 * quem deu opt-in explícito (toggle "Emails de Marketing" em Configurações).
 * O público é a pessoa responsável pela conta (dono/gestor da clínica), não
 * os pacientes.
 */
export interface MarketingAudience {
  listOptedInRecipients(): Promise<MarketingEmailRecipient[]>;
}
