import {
  AppointmentConfirmedNotification,
  ClinicNotifier,
} from "../ports/clinic-notifier";
import {
  ConfirmableAppointment,
  ConfirmationLookup,
} from "../ports/confirmation-lookup";

/** Lookup de confirmação fake, configurável por telefone. */
export class FakeConfirmationLookup implements ConfirmationLookup {
  constructor(
    private readonly byPhone: Map<string, ConfirmableAppointment> = new Map(),
  ) {}

  set(phone: string, appointment: ConfirmableAppointment) {
    this.byPhone.set(phone, appointment);
  }

  async findConfirmableByPhone(params: {
    phone: string;
    now: Date;
  }): Promise<ConfirmableAppointment | null> {
    return this.byPhone.get(params.phone) ?? null;
  }
}

/** Notificador de clínica fake que registra os avisos emitidos. */
export class FakeClinicNotifier implements ClinicNotifier {
  public readonly sent: AppointmentConfirmedNotification[] = [];

  async notifyAppointmentConfirmed(
    notification: AppointmentConfirmedNotification,
  ): Promise<void> {
    this.sent.push(notification);
  }
}
