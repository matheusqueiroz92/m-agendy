import { DomainError } from "@/core/shared/domain/domain-error";

export class PatientValidationError extends DomainError {
  readonly code = "PATIENT_VALIDATION";

  constructor(message: string) {
    super(message);
  }
}
