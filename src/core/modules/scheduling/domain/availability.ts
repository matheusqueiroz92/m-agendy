export interface TimeSlot {
  time: string; // "HH:MM"
  available: boolean;
}

export interface ProfessionalAvailability {
  availableFromWeekDay: number; // 0 (domingo) – 6 (sábado)
  availableToWeekDay: number;
  availableFromTime: string; // "HH:MM" ou "HH:MM:SS"
  availableToTime: string;
}

/** Dia da semana (0–6) de uma data "YYYY-MM-DD", em horário local (sem TZ shift). */
export const dayOfWeekFromISODate = (date: string): number => {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).getDay();
};

/**
 * Verifica se o dia da semana está dentro da janela de atendimento do
 * profissional, suportando intervalos que "dão a volta" na semana
 * (ex.: sexta→segunda).
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

/** Gera horários "HH:MM" de 30 em 30 minutos no intervalo [from, to). */
export const generateTimeSlots = (from: string, to: string): string[] => {
  const [startHour, startMinute] = from.split(":").map(Number);
  const [endHour, endMinute] = to.split(":").map(Number);

  const slots: string[] = [];
  let hour = startHour;
  let minute = startMinute;

  while (hour < endHour || (hour === endHour && minute < endMinute)) {
    slots.push(
      `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
    );
    minute += 30;
    if (minute >= 60) {
      minute -= 60;
      hour += 1;
    }
  }

  return slots;
};

/**
 * Monta a lista de slots do dia marcando como indisponíveis os horários já
 * ocupados. Se o dia não está na janela de atendimento, retorna vazio.
 */
export const computeAvailableSlots = (
  date: string,
  availability: ProfessionalAvailability,
  occupiedTimes: string[],
): TimeSlot[] => {
  const dayAvailable = isDayAvailable(
    dayOfWeekFromISODate(date),
    availability.availableFromWeekDay,
    availability.availableToWeekDay,
  );

  if (!dayAvailable) {
    return [];
  }

  const occupied = new Set(occupiedTimes);

  return generateTimeSlots(
    availability.availableFromTime,
    availability.availableToTime,
  ).map((time) => ({ time, available: !occupied.has(time) }));
};
