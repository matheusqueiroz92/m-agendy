import {
  AppointmentConfirmedNotification,
  ClinicNotifier,
  DailyLimitWarningNotification,
  WhatsAppIntegrationCompletedNotification,
  WhatsAppSharedNumberDisclosureNotification,
} from "../ports/clinic-notifier";
import {
  ConfirmableAppointment,
  ConfirmationLookup,
} from "../ports/confirmation-lookup";

/** Lookup de confirmação fake, configurável por telefone (uma ou mais candidatas). */
export class FakeConfirmationLookup implements ConfirmationLookup {
  constructor(
    private readonly byPhone: Map<string, ConfirmableAppointment[]> = new Map(),
  ) {}

  /** Define as candidatas de um telefone. Chame de novo com várias para simular ambiguidade. */
  set(phone: string, ...appointments: ConfirmableAppointment[]) {
    this.byPhone.set(phone, appointments);
  }

  async findConfirmableAppointmentsByPhone(params: {
    phone: string;
    now: Date;
  }): Promise<ConfirmableAppointment[]> {
    return this.byPhone.get(params.phone) ?? [];
  }
}

/** Notificador de clínica fake que registra os avisos emitidos. */
export class FakeClinicNotifier implements ClinicNotifier {
  public readonly sent: AppointmentConfirmedNotification[] = [];
  public readonly dailyLimitWarnings: DailyLimitWarningNotification[] = [];
  public readonly sharedNumberDisclosures: WhatsAppSharedNumberDisclosureNotification[] =
    [];
  public readonly integrationCompletions: WhatsAppIntegrationCompletedNotification[] =
    [];

  async notifyAppointmentConfirmed(
    notification: AppointmentConfirmedNotification,
  ): Promise<void> {
    this.sent.push(notification);
  }

  async notifyDailyLimitWarning(
    notification: DailyLimitWarningNotification,
  ): Promise<void> {
    this.dailyLimitWarnings.push(notification);
  }

  async notifyWhatsAppSharedNumberDisclosure(
    notification: WhatsAppSharedNumberDisclosureNotification,
  ): Promise<void> {
    this.sharedNumberDisclosures.push(notification);
  }

  async notifyWhatsAppIntegrationCompleted(
    notification: WhatsAppIntegrationCompletedNotification,
  ): Promise<void> {
    this.integrationCompletions.push(notification);
  }
}
