const MINUTE_IN_MS = 60 * 1000;

/**
 * Antecedências padrão dos lembretes, em minutos antes da consulta:
 * 24 horas e 2 horas antes.
 */
export const DEFAULT_REMINDER_OFFSETS_IN_MINUTES = [24 * 60, 2 * 60];

/**
 * Política de domínio (pura): dado o horário da consulta e o "agora", calcula
 * em quais instantes os lembretes devem ser disparados. Lembretes cujo horário
 * de disparo já passou são descartados.
 *
 * Ordena do mais cedo para o mais tarde para facilitar testes/leitura.
 */
export function computeReminderTimes(
  scheduledAt: Date,
  now: Date,
  offsetsInMinutes: number[] = DEFAULT_REMINDER_OFFSETS_IN_MINUTES,
): Date[] {
  return offsetsInMinutes
    .map((offset) => new Date(scheduledAt.getTime() - offset * MINUTE_IN_MS))
    .filter((runAt) => runAt.getTime() > now.getTime())
    .sort((a, b) => a.getTime() - b.getTime());
}
