import { DomainError } from "./domain-error";

/** Usuário não autenticado. Mapeado para 401 na borda. */
export class UnauthorizedError extends DomainError {
  readonly code = "UNAUTHORIZED";

  constructor(message = "Você precisa estar autenticado para continuar.") {
    super(message);
  }
}

/** Usuário autenticado, mas sem permissão para a ação. Mapeado para 403. */
export class ForbiddenError extends DomainError {
  readonly code = "FORBIDDEN";

  constructor(message = "Você não tem permissão para realizar esta ação.") {
    super(message);
  }
}

/** Recurso não encontrado (ou fora do escopo do tenant). Mapeado para 404. */
export class NotFoundError extends DomainError {
  readonly code = "NOT_FOUND";

  constructor(message = "Recurso não encontrado.") {
    super(message);
  }
}

/** Limite do plano atingido (ex.: nº de profissionais, agendamentos/mês). */
export class PlanLimitError extends DomainError {
  readonly code = "PLAN_LIMIT";

  constructor(message = "Limite do seu plano atingido.") {
    super(message);
  }
}
