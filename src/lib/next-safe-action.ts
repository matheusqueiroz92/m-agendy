import { createSafeActionClient } from "next-safe-action";

import { DomainError } from "@/core/shared/domain/domain-error";

/**
 * Cliente padrão das Server Actions.
 *
 * `handleServerError` centraliza o tratamento de erros na borda:
 * - Erros de domínio (DomainError) carregam mensagens prontas e seguras para o
 *   usuário, então são repassadas.
 * - Qualquer outro erro é logado no servidor e devolvido como mensagem genérica,
 *   para nunca vazar detalhes internos (stack, SQL) ao cliente.
 *
 * Conforme os contextos forem migrados, as regras passarão a lançar subclasses
 * de DomainError, e suas mensagens aparecerão automaticamente para o usuário.
 */
export const actionClient = createSafeActionClient({
  handleServerError(error) {
    if (error instanceof DomainError) {
      return error.message;
    }

    console.error("[action] erro inesperado:", error);
    return "Ocorreu um erro inesperado. Tente novamente.";
  },
});
