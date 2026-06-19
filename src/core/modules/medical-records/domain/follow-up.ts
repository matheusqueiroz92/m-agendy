import { DomainError } from "@/core/shared/domain/domain-error";

export type FollowUpStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface FollowUpProps {
  id: string;
  clinicId: string;
  patientId: string;
  title: string;
  description: string | null;
  status: FollowUpStatus;
  scheduledDate: Date | null;
  completedDate: Date | null;
}

export type FollowUpInput = {
  id?: string;
  clinicId: string;
  patientId: string;
  title: string;
  description?: string | null;
  status: FollowUpStatus;
  scheduledDate?: Date | null;
  completedDate?: Date | null;
};

export class FollowUpValidationError extends DomainError {
  readonly code = "FOLLOW_UP_VALIDATION";

  constructor(message: string) {
    super(message);
  }
}

const normalize = (value?: string | null): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

/** Acompanhamento: plano de seguimento do paciente (retornos, metas, etc.). */
export class FollowUp {
  private constructor(private readonly props: FollowUpProps) {}

  static create(input: FollowUpInput): FollowUp {
    const title = input.title.trim();
    if (!title) {
      throw new FollowUpValidationError(
        "O título do acompanhamento é obrigatório.",
      );
    }

    return new FollowUp({
      id: input.id ?? crypto.randomUUID(),
      clinicId: input.clinicId,
      patientId: input.patientId,
      title,
      description: normalize(input.description),
      status: input.status,
      scheduledDate: input.scheduledDate ?? null,
      completedDate: input.completedDate ?? null,
    });
  }

  static restore(props: FollowUpProps): FollowUp {
    return new FollowUp(props);
  }

  get id(): string {
    return this.props.id;
  }

  get clinicId(): string {
    return this.props.clinicId;
  }

  toPrimitives(): FollowUpProps {
    return { ...this.props };
  }
}
