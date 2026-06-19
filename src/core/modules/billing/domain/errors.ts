import { DomainError } from "@/core/shared/domain/domain-error";

export class BillingValidationError extends DomainError {
  readonly code = "BILLING_VALIDATION";
  constructor(message: string) {
    super(message);
  }
}
