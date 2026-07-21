/**
 * Normaliza um telefone brasileiro para o formato que a Meta Cloud API
 * (WhatsApp) espera no campo "to": apenas dígitos, com o DDI 55 na frente.
 *
 * Tolera qualquer máscara de entrada — "(11) 99999-9999", "11 99999-9999",
 * "+55 11 99999-9999", já só dígitos, etc. Números de celular (DDD + 9
 * dígitos = 11 dígitos) e fixos (DDD + 8 dígitos = 10 dígitos) sem DDI
 * recebem o prefixo "55". Números que já vêm com DDI (12 ou 13 dígitos
 * começando com "55") são mantidos como estão, para não duplicar o prefixo.
 *
 * Motivo de existir: os formulários da aplicação (paciente, responsável da
 * clínica) coletam o telefone só com DDD, sem código do país — mas a Meta
 * exige o número completo. Sem essa normalização, confirmação/lembrete
 * simplesmente não são entregues (a Meta rejeita o destinatário), sem que
 * isso apareça de forma visível para quem usa o painel.
 */
export function toE164BR(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55")) {
    return digits;
  }

  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  return digits;
}
