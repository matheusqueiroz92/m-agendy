/**
 * Número de WhatsApp comercial exibido em `contact-section.tsx` (telefone),
 * no formato internacional sem símbolos (exigido pelo link `wa.me`).
 */
const WHATSAPP_CONTACT_PHONE = "5577981257722";

/**
 * Monta o link de contato direto via WhatsApp (wa.me), com uma mensagem
 * pré-preenchida opcional. Usado nos CTAs "Falar com consultor/especialista"
 * da landing, evitando duplicar o número em múltiplos componentes.
 */
export const buildWhatsAppContactLink = (message?: string): string => {
  const base = `https://wa.me/${WHATSAPP_CONTACT_PHONE}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
};
