import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import { CLINIC_TIMEZONE } from "@/core/shared/domain/combine-date-and-time";

dayjs.extend(utc);
dayjs.extend(timezone);

export interface TimeSlot {
  time: string; // "HH:MM"
  available: boolean;
}

export interface AvailabilityWindow {
  weekDay: number; // 0 (domingo) – 6 (sábado)
  startTime: string; // "HH:MM" ou "HH:MM:SS"
  endTime: string;
}

/** Lista de janelas de atendimento do profissional. */
export type ProfessionalAvailability = AvailabilityWindow[];

export interface OccupiedInterval {
  start: Date;
  end: Date;
}

/** Dia da semana (0–6) de uma data "YYYY-MM-DD", em horário local (sem TZ shift). */
export const dayOfWeekFromISODate = (date: string): number => {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).getDay();
};

/** Normaliza "HH:MM" ou "HH:MM:SS" para minutos desde meia-noite. */
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const minutesToTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

export const addMinutes = (date: Date, minutes: number): Date =>
  new Date(date.getTime() + minutes * 60_000);

/** Intervalos [aStart, aEnd) e [bStart, bEnd) se sobrepõem. */
export const intervalsOverlap = (
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean => aStart < bEnd && bStart < aEnd;

/**
 * Verifica se o dia da semana está dentro de um intervalo contínuo de dias
 * (legado / migração), suportando wrap (ex.: sexta→segunda).
 */
export const isDayAvailable = (
  dayOfWeek: number,
  fromWeekDay: number,
  toWeekDay: number,
): boolean => {
  if (fromWeekDay <= toWeekDay) {
    return dayOfWeek >= fromWeekDay && dayOfWeek <= toWeekDay;
  }
  return dayOfWeek >= fromWeekDay || dayOfWeek <= toWeekDay;
};

/** Gera horários "HH:MM" no intervalo [from, to) com passo em minutos. */
export const generateTimeSlots = (
  from: string,
  to: string,
  stepMinutes = 15,
): string[] => {
  const start = timeToMinutes(from);
  const end = timeToMinutes(to);
  const slots: string[] = [];

  for (let current = start; current < end; current += stepMinutes) {
    slots.push(minutesToTime(current));
  }

  return slots;
};

const windowsForDay = (
  windows: AvailabilityWindow[],
  weekDay: number,
): AvailabilityWindow[] => windows.filter((w) => w.weekDay === weekDay);

/**
 * Verifica se [start, start+duration) cabe inteiramente em alguma janela
 * do dia correspondente.
 *
 * IMPORTANTE: lê dia da semana/hora/minuto no fuso da clínica
 * (`CLINIC_TIMEZONE`), não no fuso de onde o código roda. `start.getDay()`/
 * `getHours()` usariam o fuso LOCAL do processo — em produção (Vercel,
 * runtime em UTC), uma consulta às 10:00 (armazenada como 13:00 UTC)
 * apareceria como se fosse às 13:00, rejeitando horários que na verdade
 * estão dentro da disponibilidade do profissional.
 */
export const isWithinAvailability = (
  start: Date,
  durationMinutes: number,
  windows: AvailabilityWindow[],
): boolean => {
  if (durationMinutes < 15 || durationMinutes % 15 !== 0) {
    return false;
  }

  const local = dayjs(start).tz(CLINIC_TIMEZONE);
  const weekDay = local.day();
  const startMinutes = local.hour() * 60 + local.minute();
  const endMinutes = startMinutes + durationMinutes;
  const dayWindows = windowsForDay(windows, weekDay);

  return dayWindows.some((window) => {
    const windowStart = timeToMinutes(window.startTime);
    const windowEnd = timeToMinutes(window.endTime);
    return startMinutes >= windowStart && endMinutes <= windowEnd;
  });
};

/**
 * Monta slots do dia a partir das janelas. Um slot de início é disponível se
 * [start, start+slotDuration) cabe na janela e não sobrepõe ocupados.
 */
export const computeAvailableSlots = (
  date: string,
  windows: AvailabilityWindow[],
  occupiedIntervals: OccupiedInterval[],
  slotDurationMinutes = 30,
): TimeSlot[] => {
  const weekDay = dayOfWeekFromISODate(date);
  const dayWindows = windowsForDay(windows, weekDay);

  if (dayWindows.length === 0) {
    return [];
  }

  const candidateStarts = new Set<string>();

  for (const window of dayWindows) {
    for (const time of generateTimeSlots(
      window.startTime,
      window.endTime,
      15,
    )) {
      candidateStarts.add(time);
    }
  }

  const sortedTimes = Array.from(candidateStarts).sort();

  return sortedTimes.map((time) => {
    // Interpreta "date + time" explicitamente no fuso da clínica — não no
    // fuso de onde o código roda (mesmo motivo do `isWithinAvailability`
    // acima). Necessário para casar corretamente com os agendamentos já
    // salvos (`occupiedIntervals`), que são instantes UTC corretos.
    const start = dayjs.tz(`${date} ${time}`, CLINIC_TIMEZONE).toDate();
    const end = addMinutes(start, slotDurationMinutes);

    const fitsWindow = isWithinAvailability(
      start,
      slotDurationMinutes,
      windows,
    );
    const overlapsOccupied = occupiedIntervals.some((interval) =>
      intervalsOverlap(start, end, interval.start, interval.end),
    );

    return {
      time,
      available: fitsWindow && !overlapsOccupied,
    };
  });
};
