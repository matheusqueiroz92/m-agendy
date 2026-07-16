import { eq } from "drizzle-orm";

import { db } from "@/db";
import { appointmentRemindersTable } from "@/db/schema";

import {
  AppointmentReminder,
  ReminderScheduler,
} from "../../application/ports/reminder-scheduler";

/**
 * Adapter de agendamento (driven adapter) que implementa a porta
 * ReminderScheduler usando o Upstash QStash.
 *
 * Modelo do QStash: você faz POST para a API do QStash informando um destino
 * (URL do seu Route Handler) e um atraso/horário; o QStash chama esse destino
 * na hora certa. Isso encaixa perfeitamente com Next.js serverless, sem manter
 * um worker vivo.
 *
 * ESQUELETO: troca de provedor (Inngest, Trigger.dev, BullMQ) = troca deste
 * arquivo, sem tocar no caso de uso nem no domínio.
 */
export class QStashReminderScheduler implements ReminderScheduler {
  constructor(
    private readonly config: {
      token?: string;
      /** URL pública do endpoint que envia o lembrete. */
      destinationUrl?: string;
      qstashUrl?: string;
    } = {},
  ) {}

  async schedule(reminder: AppointmentReminder): Promise<void> {
    const { token, destinationUrl } = this.config;
    const qstashUrl = this.config.qstashUrl ?? "https://qstash.upstash.io/v2/publish";

    const payload = {
      appointmentId: reminder.appointmentId,
      to: reminder.to,
      patientName: reminder.patientName,
      doctorName: reminder.doctorName,
      scheduledAt: reminder.scheduledAt.toISOString(),
    };

    // Sem credenciais, apenas registra (modo desenvolvimento).
    if (!token || !destinationUrl) {
      console.info(
        `[qstash:dev] lembrete p/ ${reminder.to} em ${reminder.runAt.toISOString()}`,
        payload,
      );
      return;
    }

    // Atraso em segundos a partir de agora (mínimo 0).
    const delaySeconds = Math.max(
      0,
      Math.round((reminder.runAt.getTime() - Date.now()) / 1000),
    );

    const response = await fetch(`${qstashUrl}/${encodeURIComponent(destinationUrl)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Upstash-Delay": `${delaySeconds}s`,
        // Idempotência: evita duplicar o mesmo lembrete em retentativas.
        "Upstash-Deduplication-Id": `${reminder.appointmentId}:${reminder.runAt.getTime()}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Falha ao agendar lembrete no QStash: ${response.status}`);
    }

    // Guarda o messageId retornado para poder cancelar de verdade depois
    // (remarcação/cancelamento da consulta), via cancelForAppointment.
    const body: { messageId?: string } = await response.json().catch(() => ({}));
    if (body.messageId) {