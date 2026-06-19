import { Clock } from "@/core/shared/application/ports/clock";

import { AppointmentRepository } from "../ports/appointment-repository";
import { ClinicNotifier } from "../ports/clinic-notifier";
import { ConfirmationLookup } from "../ports/confirmation-lookup";

export interface ConfirmAppointmentFromWhatsAppInput {
  fromPhone: string;
}

export interface ConfirmAppointmentFromWhatsAppOutput {
  confirmed: boolean;
  appointmentId?: string;
}

/**
 * Confirma uma consulta a partir da resposta do paciente no WhatsApp.
 * Localiza a próxima consulta pendente do telefone, marca como confirmada e
 * avisa a clínica (notificação in-app). Idempotente do ponto de vista do
 * paciente: se não houver consulta pendente, apenas não confirma nada.
 */
export class ConfirmAppointmentFromWhatsAppUseCase {
  constructor(
    private readonly lookup: ConfirmationLookup,
    private readonly appointments: AppointmentRepository,
    private readonly notifier: ClinicNotifier,
    private readonly clock: Clock,
  ) {}

  async execute(
    input: ConfirmAppointmentFromWhatsAppInput,
  ): Promise<ConfirmAppointmentFromWhatsAppOutput> {
    const found = await this.lookup.findConfirmableByPhone({
      phone: input.fromPhone,
      now: this.clock.now(),
    });

    if (!found) {
      return { confirmed: false };
    }

    await this.appointments.updateStatus(found.appointmentId, "confirmed");

    await this.notifier.notifyAppointmentConfirmed({
      clinicId: found.clinicId,
      appointmentId: found.appointmentId,
      patientName: found.patientName,
      scheduledAt: found.scheduledAt,
    });

    return { confirmed: true, appointmentId: found.appointmentId };
  }
}
