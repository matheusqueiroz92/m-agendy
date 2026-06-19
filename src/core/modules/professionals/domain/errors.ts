import { DomainError } from "@/core/shared/domain/domain-error";

export class ProfessionalValidationError extends DomainError {
  readonly code = "PROFESSIONAL_VALIDATION";

  constructor(message: string) {
    super(message);
  }
}
