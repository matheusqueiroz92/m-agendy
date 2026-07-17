import dayjs from "dayjs";

import { Clock } from "@/core/shared/application/ports/clock";

import { AppointmentRepository } from "../ports/appointment-repository";
import { WhatsAppMessenger } from "../ports/chatbot-ports";
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
 *
 * - Nenhuma consulta pendente para o telefone → não confirma nada.
 * - Exatamente uma → confirma e avisa a clínica (notificação in-app).
 * - Mais de uma → NÃO adivinha qual (arriscaria confirmar a errada); em vez
 *   disso, responde ao paciente pedindo para falar com a clínica informando a
 *   data. É seguro enviar texto livre aqui: a resposta chega dentro da janela
 *   de 24h aberta pela mensagem que o paciente acabou de enviar.
 */
export class ConfirmAppointmentFromWhatsAppUseCase {
  constructor(
    private readonly lookup: ConfirmationLookup,
    private readonly appointments: AppointmentRepository,
    private readonly notifier: ClinicNotifier,
    private readonly clock: Clock,
    private readonly messenger: WhatsAppMessenger,
  ) {}

  async execute(
    input: ConfirmAppointmentFromWhatsAppInput,
  ): Promise<ConfirmAppointmentFromWhatsAppOutput> {
    const candidates = await this.lookup.findConfirmableAppointmentsByPhone({
      phone: input.fromPhone,
      now: this.clock.now(),
    });

    if (candidates.length === 0) {
      return { confirmed: false };
    }

    if (candidates.length > 1) {
      const list = candidates
        .map(
          (candidate, index) =>
            `${index + 1}. ${dayjs(candidate.scheduledAt).format("DD/MM/YYYY [às] HH:mm")}`,
        )
        .join("\n");

      await this.messenger.sendText({
        to: input.fromPhone,
        // Melhor esforço: usa a clínica da primeira candidata. Casos raros de
        // ambiguidade cruzando clínicas diferentes ficam com o número dela.
        clinicId: candidates[0].clinicId,
        body:
          `Encontrei mais de uma consulta pendente para confirmar:\n\n${list}\n\n` +
          "Para confirmar, entre em contato com a clínica informando a data.",
      });

      return { confirmed: false };
    }

    const found = candidates[0];

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
