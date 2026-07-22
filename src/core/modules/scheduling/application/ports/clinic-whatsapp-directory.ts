/**
 * Resolve o `phone_number_id` (Meta Cloud API) configurado pela própria
 * clínica, para envio multi-tenant de WhatsApp — cada clínica pode ter seu
 * próprio número cadastrado em Configurações.
 *
 * Retorna `null` quando a clínica não configurou um número próprio; quem
 * chama deve então cair no número global compartilhado (fallback via env).
 */
export interface ClinicWhatsAppDirectory {
  getPhoneNumberId(clinicId: string): Promise<string | null>;
  /** Grava o phone_number_id próprio da clínica (integração concluída). */
  setPhoneNumberId(clinicId: string, phoneNumberId: string): Promise<void>;
}
