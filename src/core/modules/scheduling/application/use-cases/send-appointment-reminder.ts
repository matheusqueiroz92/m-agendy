import { AppointmentNotifier } from "../ports/appointment-notifier";
import { AppointmentRepository } from "../ports/appointment-repository";

export interface SendAppointmentReminderInput {
  appointmentId: string;
  to: string;
  patientName: string;
  scheduledAt: Date;
  doctorName?: string;
}

export interface SendAppointmentReminderOutput {
  sent: boolean;
}

/**
 * Caso de uso disparado pelo agendador quando chega a hora do lembrete.
 *
 * Reconfere se o agendamento ainda existe (pode ter sido cancelado depois de o
 * lembrete ter sido enfileirado) antes de enviar. É chamado pelo Route Handler
 * que recebe o callback da fila (ex.: QStash) — outra "casca de delivery".
 */
export class SendAppointmentReminderUseCase {
  constructor(
    private readonly appointments: AppointmentRepository,
    private readonly notifier: AppointmentNotifier,
  ) {}

  async execute(
    input: SendAppointmentReminderInput,
  ): Promise<SendAppointmentReminderOutput> {
    const appointment = await this.appointments.findById(input.appointmentId);

    // Agendamento não existe mais (cancelado/removido): não envia.
    if (!appointment) {
      return { sent: false };
    }

    await this.notifier.notifyReminder({
      to: input.to,
      patientName: input.patientName,
      scheduledAt: input.scheduledAt,
      doctorName: input.doctorName,
    });

    return { sent: true };
  }
}
