import { InvalidAppointmentPriceError } from "./errors";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "no_show";

export interface AppointmentProps {
  id: string;
  clinicId: string;
  patientId: string;
  doctorId: string;
  scheduledAt: Date;
  priceInCents: number;
  status: AppointmentStatus;
}

/**
 * Entidade de domínio Appointment.
 *
 * Não conhece banco de dados, Next.js nem WhatsApp. Concentra invariantes que
 * dependem apenas do próprio agendamento (ex.: preço > 0). Regras que precisam
 * de outros agregados (ex.: conflito de horário) ficam no caso de uso.
 */
export class Appointment {
  private constructor(private readonly props: AppointmentProps) {}

  /** Cria um novo agendamento, validando as invariantes. */
  static create(
    input: Omit<AppointmentProps, "id" | "status"> & {
      id?: string;
      status?: AppointmentStatus;
    },
  ): Appointment {
    if (!Number.isInteger(input.priceInCents) || input.priceInCents <= 0) {
      throw new InvalidAppointmentPriceError();
    }

    return new Appointment({
      clinicId: input.clinicId,
      patientId: input.patientId,
      doctorId: input.doctorId,
      scheduledAt: input.scheduledAt,
      priceInCents: input.priceInCents,
      id: input.id ?? crypto.randomUUID(),
      status: input.status ?? "pending",
    });
  }

  /** Reidrata um agendamento já persistido (sem revalidar invariantes). */
  static restore(props: AppointmentProps): Appointment {
    return new Appointment(props);
  }

  /** Retorna uma cópia com o status alterado. */
  withStatus(status: AppointmentStatus): Appointment {
    return new Appointment({ ...this.props, status });
  }

  get id(): string {
    return this.props.id;
  }

  get clinicId(): string {
    return this.props.clinicId;
  }

  get doctorId(): string {
    return this.props.doctorId;
  }

  get patientId(): string {
    return this.props.patientId;
  }

  get scheduledAt(): Date {
    return this.props.scheduledAt;
  }

  get priceInCents(): number {
    return this.props.priceInCents;
  }

  get status(): AppointmentStatus {
    return this.props.status;
  }

  toPrimitives(): AppointmentProps {
    return { ...this.props };
  }
}
