import { DomainError } from "@/core/shared/domain/domain-error";

/** Assunto/corpo do e-mail de marketing vazio ou inválido. */
export class MarketingValidationError extends DomainError {
  readonly code = "MARKETING_VALIDATION";
  constructor(message: string) {
    super(message);
  }
}
