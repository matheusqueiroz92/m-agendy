import { DomainError } from "@/core/shared/domain/domain-error";

export interface PrescriptionProps {
  id: string;
  clinicId: string;
  patientId: string;
  doctorId: string | null;
  attendanceId: string | null;
  medication: string;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  instructions: string | null;
  date: Date;
}

export type PrescriptionInput = {
  id?: string;
  clinicId: string;
  patientId: string;
  doctorId?: string | null;
  attendanceId?: string | null;
  medication: string;
  dosage?: string | null;
  frequency?: string | null;
  duration?: string | null;
  instructions?: string | null;
  date: Date;
};

export class PrescriptionValidationError extends DomainError {
  readonly code = "PRESCRIPTION_VALIDATION";

  constructor(message: string) {
    super(message);
  }
}

const normalize = (value?: string | null): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

/** Prescrição (medicamento) registrada no prontuário do paciente. */
export class Prescription {
  private constructor(private readonly props: PrescriptionProps) {}

  static create(input: PrescriptionInput): Prescription {
    const medication = input.medication.trim();
    if (!medication) {
      throw new PrescriptionValidationError("O medicamento é obrigatório.");
    }

    return new Prescription({
      id: input.id ?? crypto.randomUUID(),
      clinicId: input.clinicId,
      patientId: input.patientId,
      doctorId: input.doctorId ?? null,
      attendanceId: input.attendanceId ?? null,
      medication,
      dosage: normalize(input.dosage),
      frequency: normalize(input.frequency),
      duration: normalize(input.duration),
      instructions: normalize(input.instructions),
      date: input.date,
    });
  }

  static restore(props: PrescriptionProps): Prescription {
    return new Prescription(props);
  }

  get id(): string {
    return this.props.id;
  }

  get clinicId(): string {
    return this.props.clinicId;
  }

  toPrimitives(): PrescriptionProps {
    return { ...this.props };
  }
}
