import { ProfessionalValidationError } from "./errors";

export interface ProfessionalProps {
  id: string;
  clinicId: string;
  name: string;
  speciality: string;
  phoneNumber: string | null;
  avatarImageUrl: string | null;
  appointmentPriceInCents: number;
  availableFromWeekDay: number; // 0 (domingo) – 6 (sábado)
  availableToWeekDay: number;
  availableFromTime: string; // "HH:mm" ou "HH:mm:ss"
  availableToTime: string;
}

export type NewProfessionalInput = Omit<
  ProfessionalProps,
  "id" | "phoneNumber" | "avatarImageUrl"
> & {
  id?: string;
  phoneNumber?: string | null;
  avatarImageUrl?: string | null;
};

const isWeekDay = (value: number) =>
  Number.isInteger(value) && value >= 0 && value <= 6;

/**
 * Entidade de domínio Professional (médico, dentista, nutricionista, etc.).
 * Generaliza o antigo "Doctor"; a tabela física continua sendo `doctors`.
 */
export class Professional {
  private constructor(private readonly props: ProfessionalProps) {}

  static create(input: NewProfessionalInput): Professional {
    const name = input.name.trim();
    const speciality = input.speciality.trim();

    if (!name) {
      throw new ProfessionalValidationError(
        "O nome do profissional é obrigatório.",
      );
    }
    if (!speciality) {
      throw new ProfessionalValidationError("A especialidade é obrigatória.");
    }
    if (
      !Number.isInteger(input.appointmentPriceInCents) ||
      input.appointmentPriceInCents <= 0
    ) {
      throw new ProfessionalValidationError(
        "O preço da consulta deve ser maior que zero.",
      );
    }
    if (!isWeekDay(input.availableFromWeekDay) || !isWeekDay(input.availableToWeekDay)) {
      throw new ProfessionalValidationError("Dia da semana inválido.");
    }
    if (!input.availableFromTime || !input.availableToTime) {
      throw new ProfessionalValidationError(
        "Os horários de disponibilidade são obrigatórios.",
      );
    }
    if (input.availableFromTime >= input.availableToTime) {
      throw new ProfessionalValidationError(
        "O horário de início deve ser anterior ao de término.",
      );
    }

    const normalize = (value?: string | null) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed : null;
    };

    return new Professional({
      id: input.id ?? crypto.randomUUID(),
      clinicId: input.clinicId,
      name,
      speciality,
      phoneNumber: normalize(input.phoneNumber),
      avatarImageUrl: normalize(input.avatarImageUrl),
      appointmentPriceInCents: input.appointmentPriceInCents,
      availableFromWeekDay: input.availableFromWeekDay,
      availableToWeekDay: input.availableToWeekDay,
      availableFromTime: input.availableFromTime,
      availableToTime: input.availableToTime,
    });
  }

  static restore(props: ProfessionalProps): Professional {
    return new Professional(props);
  }

  get id(): string {
    return this.props.id;
  }

  get clinicId(): string {
    return this.props.clinicId;
  }

  toPrimitives(): ProfessionalProps {
    return { ...this.props };
  }
}
