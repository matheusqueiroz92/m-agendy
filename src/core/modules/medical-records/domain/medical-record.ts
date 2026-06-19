export interface MedicalRecordProps {
  patientId: string;
  clinicId: string;
  bloodType: string | null;
  allergies: string | null;
  medicationsInUse: string | null;
  clinicalHistory: string | null;
  surgicalHistory: string | null;
  familyHistory: string | null;
  habits: string | null;
  notes: string | null;
}

export type MedicalRecordInput = {
  patientId: string;
  clinicId: string;
} & Partial<Omit<MedicalRecordProps, "patientId" | "clinicId">>;

const normalize = (value?: string | null): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

/**
 * Prontuário base do paciente (antecedentes, alergias, medicamentos, hábitos).
 * Relação 1:1 com o paciente — por isso é identificado por patientId, não por
 * um id próprio. Campos vazios são normalizados para null.
 */
export class MedicalRecord {
  private constructor(private readonly props: MedicalRecordProps) {}

  static create(input: MedicalRecordInput): MedicalRecord {
    return new MedicalRecord({
      patientId: input.patientId,
      clinicId: input.clinicId,
      bloodType: normalize(input.bloodType),
      allergies: normalize(input.allergies),
      medicationsInUse: normalize(input.medicationsInUse),
      clinicalHistory: normalize(input.clinicalHistory),
      surgicalHistory: normalize(input.surgicalHistory),
      familyHistory: normalize(input.familyHistory),
      habits: normalize(input.habits),
      notes: normalize(input.notes),
    });
  }

  static restore(props: MedicalRecordProps): MedicalRecord {
    return new MedicalRecord(props);
  }

  get patientId(): string {
    return this.props.patientId;
  }

  get clinicId(): string {
    return this.props.clinicId;
  }

  toPrimitives(): MedicalRecordProps {
    return { ...this.props };
  }
}
