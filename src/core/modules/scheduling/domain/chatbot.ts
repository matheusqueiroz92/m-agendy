/** Passos da conversa de agendamento via WhatsApp. */
export const CHATBOT_STEPS = {
  CHOOSING_PROFESSIONAL: "choosing_professional",
  CHOOSING_DATE: "choosing_date",
  CHOOSING_TIME: "choosing_time",
} as const;

export type ChatbotStep =
  (typeof CHATBOT_STEPS)[keyof typeof CHATBOT_STEPS];

export interface ChatbotOption {
  id: string;
  label: string;
}

/** Estado serializável guardado por telefone. */
export interface ChatbotData {
  professionals?: ChatbotOption[];
  doctorId?: string;
  doctorLabel?: string;
  dateISO?: string; // "YYYY-MM-DD"
  times?: string[]; // "HH:MM"
}

/** Palavras que cancelam a conversa em qualquer passo. */
export const CANCEL_WORDS = ["cancelar", "sair", "parar"];

export const isCancel = (text: string): boolean =>
  CANCEL_WORDS.includes(text.trim().toLowerCase());

/** Interpreta a escolha numérica (1..max). Retorna o índice 0-based ou null. */
export const parseSelection = (text: string, max: number): number | null => {
  const value = Number(text.trim());
  if (!Number.isInteger(value) || value < 1 || value > max) {
    return null;
  }
  return value - 1;
};

/** Interpreta "DD/MM/AAAA" ou "DD/MM" (ano atual). Retorna Date local ou null. */
export const parseDate = (text: string, today: Date): Date | null => {
  const match = text.trim().match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  let year = match[3] ? Number(match[3]) : today.getFullYear();
  if (year < 100) year += 2000;

  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const date = new Date(year, month - 1, day);
  // Rejeita datas inválidas (ex.: 31/02 vira março).
  if (date.getMonth() !== month - 1 || date.getDate() !== day) return null;

  return date;
};

/** "YYYY-MM-DD" em horário local. */
export const toISODate = (date: Date): string => {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/** Combina "YYYY-MM-DD" + "HH:MM" num Date local. */
export const combineDateTime = (dateISO: string, time: string): Date => {
  const [y, m, d] = dateISO.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
};

/** Formata uma lista numerada: "1. Item\n2. Item". */
export const formatNumberedList = (labels: string[]): string =>
  labels.map((label, index) => `${index + 1}. ${label}`).join("\n");
