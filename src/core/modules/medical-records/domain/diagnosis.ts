import { DomainError } from "@/core/shared/domain/domain-error";

export type DiagnosisStatus = "active" | "resolved" | "chronic";

export interface DiagnosisProps {
  id: string;
  clinicId: string;
  patientId: string;
  attendanceId: string | null;
  description: string;
  cid10Code: string | null;
  status: DiagnosisStatus;
  date: Date;
  notes: string | null;
}

export type DiagnosisInput = {
  id?: string;
  clinicId: string;
  patientId: string;
  attendanceId?: string | null;
  description: string;
  cid10Code?: string | null;
  status: DiagnosisStatus;
  date: Date;
  notes?: string | null;
};

export class DiagnosisValidationError extends DomainError {
  readonly code = "DIAGNOSIS_VALIDATION";

  constructor(message: string) {
    super(message);
  }
}

const normalize = (value?: string | null): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

/** Diagnóstico registrado no prontuário do paciente. */
export class Diagnosis {
  private constructor(private readonly props: DiagnosisProps) {}

  static create(input: DiagnosisInput): Diagnosis {
    const description = input.description.trim();
    if (!description) {
      throw new DiagnosisValidationError(
        "A descrição do diagnóstico é obrigatória.",
      );
    }

    return new Diagnosis({
      id: input.id ?? crypto.randomUUID(),
      clinicId: input.clinicId,
      patientId: input.patientId,
      attendanceId: input.attendanceId ?? null,
      description,
      cid10Code: normalize(input.cid10Code),
      status: input.status,
      date: input.date,
      notes: normalize(input.notes),
    });
  }

  static restore(props: DiagnosisProps): Diagnosis {
    return new Diagnosis(props);
  }

  get id(): string {
    return this.props.id;
  }

  get clinicId(): string {
    return this.props.clinicId;
  }

  toPrimitives(): DiagnosisProps {
    return { ...this.props };
  }
}
