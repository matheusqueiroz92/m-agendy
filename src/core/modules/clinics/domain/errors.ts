import { DomainError } from "@/core/shared/domain/domain-error";

export class ClinicValidationError extends DomainError {
  readonly code = "CLINIC_VALIDATION";
  constructor(message: string) {
    super(message);
  }
}
