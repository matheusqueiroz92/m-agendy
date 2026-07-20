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
      "Já existe um agendamento para este profissional neste horário. Escolha outro horário.",
    );
  }
}

export class InvalidAppointmentDurationError extends DomainError {
  readonly code = "INVALID_APPOINTMENT_DURATION";

  constructor() {
    super("A duração da consulta deve ser um múltiplo de 15 minutos (mínimo 15).");
  }
}

export class AppointmentOutsideAvailabilityError extends DomainError {
  readonly code = "APPOINTMENT_OUTSIDE_AVAILABILITY";

  constructor() {
    super(
      "O horário escolhido está fora da disponibilidade do profissional.",
    );
  }
}
