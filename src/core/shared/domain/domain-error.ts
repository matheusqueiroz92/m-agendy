/**
 * Erro base do domínio. Todos os erros de regra de negócio devem estender
 * desta classe, permitindo que a camada de delivery (Server Actions, Route
 * Handlers, futura API) os trate de forma uniforme e os mapeie para respostas
 * apropriadas — sem que o domínio conheça HTTP, Next.js ou qualquer framework.
 */
export abstract class DomainError extends Error {
  /** Código estável para mapeamento na borda (ex.: tradução, status HTTP). */
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}
