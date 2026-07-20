import { ProfessionalValidationError } from "./errors";
import {
  AvailabilityWindow,
  timeToMinutes,
} from "@/core/modules/scheduling/domain/availability";

export interface ProfessionalProps {
  id: string;
  clinicId: string;
  name: string;
  speciality: string;
  phoneNumber: string | null;
  avatarImageUrl: string | null;
  appointmentPriceInCents: number;
  defaultAppointmentDurationInMinutes: number;
  availabilityWindows: AvailabilityWindow[];
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

const isValidDuration = (minutes: number) =>
  Number.isInteger(minutes) && minutes >= 15 && minutes % 15 === 0;

const windowsOverlapSameDay = (windows: AvailabilityWindow[]) => {
  const byDay = new Map<number, AvailabilityWindow[]>();
  for (const window of windows) {
    const list = byDay.get(window.weekDay) ?? [];
    list.push(window);
    byDay.set(window.weekDay, list);
  }

  for (const dayWindows of byDay.values()) {
    const sorted = [...dayWindows].sort(
      (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
    );
    for (let i = 1; i < sorted.length; i++) {
      if (
        timeToMinutes(sorted[i].startTime) < timeToMinutes(sorted[i - 1].endTime)
      ) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Entidade de domínio Professional (médico, dentista, nutricionista, etc.).
 * A tabela física continua sendo `doctors`.
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
    if (!isValidDuration(input.defaultAppointmentDurationInMinutes)) {
      throw new ProfessionalValidationError(
        "A duração padrão deve ser um múltiplo de 15 minutos (mínimo 15).",
      );
    }
    if (
      !input.availabilityWindows ||
      input.availabilityWindows.length === 0
    ) {
      throw new ProfessionalValidationError(
        "Informe ao menos um horário de atendimento.",
      );
    }

    for (const window of input.availabilityWindows) {
      if (!isWeekDay(window.weekDay)) {
        throw new ProfessionalValidationError("Dia da semana inválido.");
      }
      if (!window.startTime || !window.endTime) {
        throw new ProfessionalValidationError(
          "Os horários de disponibilidade são obrigatórios.",
        );
      }
      if (timeToMinutes(window.startTime) >= timeToMinutes(window.endTime)) {
        throw new ProfessionalValidationError(
          "O horário de início deve ser anterior ao de término.",
        );
      }
      if (
        timeToMinutes(window.endTime) - timeToMinutes(window.startTime) <
        15
      ) {
        throw new ProfessionalValidationError(
          "Cada intervalo deve ter pelo menos 15 minutos.",
        );
      }
    }

    if (windowsOverlapSameDay(input.availabilityWindows)) {
      throw new ProfessionalValidationError(
        "Há intervalos sobrepostos no mesmo dia.",
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
      defaultAppointmentDurationInMinutes:
        input.defaultAppointmentDurationInMinutes,
      availabilityWindows: input.availabilityWindows.map((w) => ({ ...w })),
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
    return {
      ...this.props,
      availabilityWindows: this.props.availabilityWindows.map((w) => ({
        ...w,
      })),
    };
  }
}
