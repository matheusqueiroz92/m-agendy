import { Clock } from "@/core/shared/application/ports/clock";

import {
  AppointmentCancelledNotification,
  AppointmentNotifier,
  AppointmentReminderNotification,
  AppointmentScheduledNotification,
} from "../ports/appointment-notifier";
import { ClinicReminderPreference } from "../ports/clinic-reminder-preference";
import { ClinicWhatsAppDirectory } from "../ports/clinic-whatsapp-directory";
import {
  AppointmentReminder,
  ReminderScheduler,
} from "../ports/reminder-scheduler";

/** Notificador fake que apenas registra os envios, para asserções nos testes. */
export class FakeAppointmentNotifier implements AppointmentNotifier {
  public readonly scheduled: AppointmentScheduledNotification[] = [];
  public readonly reminders: AppointmentReminderNotification[] = [];
  public readonly cancelled: AppointmentCancelledNotification[] = [];

  async notifyScheduled(
    notification: AppointmentScheduledNotification,
  ): Promise<void> {
    this.scheduled.push(notification);
  }

  async notifyReminder(
    notification: AppointmentReminderNotification,
  ): Promise<void> {
    this.reminders.push(notification);
  }

  async notifyCancelled(
    notification: AppointmentCancelledNotification,
  ): Promise<void> {
    this.cancelled.push(notification);
  }
}

/** Agendador de lembretes em memória, para uso em testes. */
export class InMemoryReminderScheduler implements ReminderScheduler {
  public scheduled: AppointmentReminder[] = [];

  async schedule(reminder: AppointmentReminder): Promise<void> {
    this.scheduled.push(reminder);
  }

  async cancelForAppointment(appointmentId: string): Promise<void> {
    this.scheduled = this.scheduled.filter(
      (reminder) => reminder.appointmentId !== appointmentId,
    );
  }
}

/** Relógio fixo: torna os testes determinísticos. */
export class FixedClock implements Clock {
  constructor(private readonly fixed: Date) {}

  now(): Date {
    return this.fixed;
  }
}


/** ClinicPlanProvider fake: devolve um plano fixo (null = sem limite). */
export class FakeClinicPlanProvider {
  constructor(private readonly plan: string | null = null) {}
  async getEffectivePlan(): Promise<string | null> {
    return this.plan;
  }
}

/**
 * ClinicReminderPreference fake: liga/desliga os lembretes por padrão (true),
 * para os testes que precisam simular a clínica desativando o toggle.
 */
export class FakeClinicReminderPreference implements ClinicReminderPreference {
  constructor(private readonly enabled: boolean = true) {}

  async areRemindersEnabled(): Promise<boolean> {
    return this.enabled;
  }
}

/** ClinicWhatsAppDirectory fake: números por clínica configuráveis em memória. */
export class FakeClinicWhatsAppDirectory implements ClinicWhatsAppDirectory {
  private readonly numbers = new Map<string, string>();

  set(clinicId: string, phoneNumberId: string): void {
    this.numbers.set(clinicId, phoneNumberId);
  }

  async getPhoneNumberId(clinicId: string): Promise<string | null> {
    return this.numbers.get(clinicId) ?? null;
  }

  async setPhoneNumberId(clinicId: string, phoneNumberId: string): Promise<void> {
    this.numbers.set(clinicId, phoneNumberId);
  }
}
