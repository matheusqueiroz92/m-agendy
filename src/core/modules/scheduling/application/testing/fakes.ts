import { Clock } from "@/core/shared/application/ports/clock";

import {
  AppointmentNotifier,
  AppointmentReminderNotification,
  AppointmentScheduledNotification,
} from "../ports/appointment-notifier";
import {
  AppointmentReminder,
  ReminderScheduler,
} from "../ports/reminder-scheduler";

/** Notificador fake que apenas registra os envios, para asserções nos testes. */
export class FakeAppointmentNotifier implements AppointmentNotifier {
  public readonly scheduled: AppointmentScheduledNotification[] = [];
  public readonly reminders: AppointmentReminderNotification[] = [];

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
