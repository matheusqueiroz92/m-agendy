/**
 * Palavras que indicam confirmação de presença. Comparadas por TOKEN (não por
 * substring nem por igualdade da frase inteira), para tolerar variações reais
 * de resposta do paciente ("Sim, confirmo!", "ok obrigado", "Confirmado.").
 */
const CONFIRM_WORDS = [
  "sim",
  "ok",
  "okay",
  "confirmar",
  "confirmo",
  "confirmado",
  "confirmada",
];

/**
 * Palavras que, se presentes, indicam recusa/negação — mesmo que uma palavra
 * de confirmação também apareça na frase (ex.: "não vou confirmar" contém
 * "confirmar", mas o sentido é negativo). Checar negação tem prioridade sobre
 * checar confirmação.
 */
const NEGATION_WORDS = ["nao", "cancelar", "cancela"];

/** Remove acentos, pontuação, e normaliza espaços/caixa. */
const COMBINING_DIACRITICS = /[̀-ͯ]/g;

const normalize = (text: string): string =>
  text
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .trim();

const tokenize = (text: string): string[] =>
  normalize(text)
    .split(/\s+/)
    .filter(Boolean);

/**
 * Interpreta se o texto recebido no WhatsApp é uma confirmação de presença.
 * Função pura de domínio — sem acoplamento ao formato do payload da Meta.
 */
export const isConfirmationReply = (text: string): boolean => {
  const tokens = tokenize(text);
  if (tokens.length === 0) return false;
  if (tokens.some((token) => NEGATION_WORDS.includes(token))) return false;
  return tokens.some((token) => CONFIRM_WORDS.includes(token));
};
