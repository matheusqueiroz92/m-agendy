import { DomainError } from "@/core/shared/domain/domain-error";

export class InvalidAppointmentPriceError extends DomainError {
  readonly code = "INVALID_APPOINTMENT_PRICE";

  constructor() {
    super("O valor da consulta deve ser maior que zero.");
  }
}

export class AppointmentInThePastError extends DomainError {
  readonly code = "APPOINTMENT_IN_THE_PAST";

  constructor() {
    super("Não é possível agendar uma consulta em uma data/horário passado.");
  }
}

export class AppointmentConflictError extends DomainError {
  readonly code = "APPOINTMENT_CONFLICT";

  constructor() {
    super(
      "Já existe um agendamento para este médico neste horário. Escolha outro horário.",
    );
  }
}
