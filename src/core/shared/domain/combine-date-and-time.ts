import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Fuso horário assumido para todos os agendamentos da aplicação (produto
 * hoje voltado só para clínicas no Brasil, fuso de Brasília). Se o produto
 * expandir para clínicas em outros fusos, isso precisa virar uma
 * configuração por clínica em vez de uma constante global.
 */
export const CLINIC_TIMEZONE = "America/Sao_Paulo";

/**
 * Combina uma data (usa-se apenas ano/mês/dia, lidos em UTC) com um horário
 * "HH:mm", interpretando o resultado no fuso horário da clínica
 * (`CLINIC_TIMEZONE`) — nunca no fuso horário de onde o código roda.
 *
 * Motivo de existir: montar a data com `Date.prototype.setHours` usa o fuso
 * horário LOCAL do processo que executa o código. Isso "funciona por
 * acidente" em dev, quando a máquina do desenvolvedor já está no fuso do
 * Brasil, mas em produção (Vercel, runtime em UTC) o mesmo código desloca o
 * horário (ex.: 10:00 vira 07:00, uma diferença de 3h que bate exatamente
 * com o UTC-3 de Brasília).
 */
export function combineDateAndTimeInClinicTimezone(
  date: Date,
  time: string,
): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  const pad = (value: number) => String(value).padStart(2, "0");

  return dayjs
    .tz(
      `${year}-${pad(month + 1)}-${pad(day)} ${pad(hours)}:${pad(minutes)}`,
      CLINIC_TIMEZONE,
    )
    .toDate();
}

/**
 * Formata um instante (Date, sempre um UTC absoluto) no fuso horário da
 * clínica (`CLINIC_TIMEZONE`) — nunca no fuso horário de onde o código roda.
 *
 * Motivo de existir: `dayjs(date).format(...)` sem `.tz(...)` usa o fuso
 * horário LOCAL do processo. Em produção (Vercel, runtime em UTC), isso faz
 * mensagens/telas mostrarem o horário errado (ex.: uma consulta às 10:00
 * aparece como 13:00) mesmo que o instante armazenado esteja correto.
 */
export function formatInClinicTimezone(date: Date, pattern: string): string {
  return dayjs(date).tz(CLINIC_TIMEZONE).format(pattern);
}
