export interface ClinicalAttendanceProps {
  id: string;
  clinicId: string;
  patientId: string;
  doctorId: string | null;
  appointmentId: string | null;
  date: Date;
  chiefComplaint: string | null;
  historyOfPresentIllness: string | null;
  physicalExam: string | null;
  conduct: string | null;
  notes: string | null;
}

export type ClinicalAttendanceInput = {
  id?: string;
  clinicId: string;
  patientId: string;
  doctorId?: string | null;
  appointmentId?: string | null;
  date: Date;
  chiefComplaint?: string | null;
  historyOfPresentIllness?: string | null;
  physicalExam?: string | null;
  conduct?: string | null;
  notes?: string | null;
};

const normalize = (value?: string | null): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

/**
 * Atendimento clínico: o que aconteceu numa consulta (queixa, anamnese, exame
 * físico, conduta). Pode estar vinculado a um agendamento e a um profissional.
 */
export class ClinicalAttendance {
  private constructor(private readonly props: ClinicalAttendanceProps) {}

  static create(input: ClinicalAttendanceInput): ClinicalAttendance {
    return new ClinicalAttendance({
      id: input.id ?? crypto.randomUUID(),
      clinicId: input.clinicId,
      patientId: input.patientId,
      doctorId: input.doctorId ?? null,
      appointmentId: input.appointmentId ?? null,
      date: input.date,
      chiefComplaint: normalize(input.chiefComplaint),
      historyOfPresentIllness: normalize(input.historyOfPresentIllness),
      physicalExam: normalize(input.physicalExam),
      conduct: normalize(input.conduct),
      notes: normalize(input.notes),
    });
  }

  static restore(props: ClinicalAttendanceProps): ClinicalAttendance {
    return new ClinicalAttendance(props);
  }

  get id(): string {
    return this.props.id;
  }

  get clinicId(): string {
    return this.props.clinicId;
  }

  toPrimitives(): ClinicalAttendanceProps {
    return { ...this.props };
  }
}
