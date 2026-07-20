export const SLOT_MINUTES = 15;
export const DAY_START_HOUR = 7;
export const DAY_END_HOUR = 19;
export const SLOT_HEIGHT_PX = 20;
export const TOTAL_SLOTS =
  ((DAY_END_HOUR - DAY_START_HOUR) * 60) / SLOT_MINUTES;
export const GRID_HEIGHT_PX = TOTAL_SLOTS * SLOT_HEIGHT_PX;

export const WEEKDAY_LABELS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
] as const;

export function minutesFromDayStart(hours: number, minutes: number) {
  return (hours - DAY_START_HOUR) * 60 + minutes;
}

export function topForDate(date: Date) {
  return (
    (minutesFromDayStart(date.getHours(), date.getMinutes()) / SLOT_MINUTES) *
    SLOT_HEIGHT_PX
  );
}

export function heightForDuration(durationInMinutes: number) {
  return (durationInMinutes / SLOT_MINUTES) * SLOT_HEIGHT_PX;
}

export function snapMinutes(totalMinutes: number) {
  return Math.round(totalMinutes / SLOT_MINUTES) * SLOT_MINUTES;
}

export function dateFromDayAndOffset(
  day: Date,
  offsetMinutesFromStart: number,
) {
  const snapped = snapMinutes(offsetMinutesFromStart);
  const hours = DAY_START_HOUR + Math.floor(snapped / 60);
  const minutes = snapped % 60;
  const result = new Date(day);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

export function formatTimeRange(start: Date, durationInMinutes: number) {
  const end = new Date(start.getTime() + durationInMinutes * 60_000);
  const fmt = (d: Date) =>
    `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${fmt(start)} – ${fmt(end)}`;
}

export function startOfWeek(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d;
}

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatDayHeader(date: Date) {
  const label = WEEKDAY_LABELS[date.getDay()];
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleDateString("pt-BR", { month: "short" });
  return `${label} ${day}/${month}`;
}

export function formatPeriodLabel(days: Date[], mode: "day" | "week") {
  if (mode === "day" || days.length === 1) {
    return days[0].toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
    });
  }
  const first = days[0];
  const last = days[days.length - 1];
  return `${String(first.getDate()).padStart(2, "0")}/${String(first.getMonth() + 1).padStart(2, "0")} a ${String(last.getDate()).padStart(2, "0")}/${String(last.getMonth() + 1).padStart(2, "0")}`;
}
