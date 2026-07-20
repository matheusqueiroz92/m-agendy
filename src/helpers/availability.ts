import "dayjs/locale/pt-br";

import dayjs from "dayjs";

import { doctorAvailabilityWindowsTable, doctorsTable } from "@/db/schema";

dayjs.locale("pt-br");

const WEEKDAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

type DoctorWithWindows = typeof doctorsTable.$inferSelect & {
  availabilityWindows?: (typeof doctorAvailabilityWindowsTable.$inferSelect)[];
};

/** Resumo legível da disponibilidade do profissional para cards. */
export const getAvailabilitySummary = (doctor: DoctorWithWindows) => {
  const windows = doctor.availabilityWindows ?? [];
  if (windows.length === 0) {
    return { daysLabel: "Sem horários", hoursLabel: "—" };
  }

  const days = [...new Set(windows.map((w) => w.weekDay))].sort(
    (a, b) => a - b,
  );
  const daysLabel = days.map((d) => WEEKDAY_SHORT[d]).join(", ");

  const times = windows
    .map((w) => {
      const start = w.startTime.slice(0, 5);
      const end = w.endTime.slice(0, 5);
      return `${start}–${end}`;
    })
    .slice(0, 3);

  const hoursLabel =
    times.length < windows.length
      ? `${times.join(", ")}…`
      : times.join(", ");

  return { daysLabel, hoursLabel };
};

/** @deprecated Prefer getAvailabilitySummary with availabilityWindows. */
export const getAvailability = (doctor: DoctorWithWindows) => {
  const windows = doctor.availabilityWindows ?? [];
  const first = windows[0];
  const from = dayjs()
    .day(first?.weekDay ?? 1)
    .hour(Number((first?.startTime ?? "08:00").split(":")[0]))
    .minute(Number((first?.startTime ?? "08:00").split(":")[1] ?? 0))
    .second(0);
  const to = dayjs()
    .day(first?.weekDay ?? 5)
    .hour(Number((first?.endTime ?? "18:00").split(":")[0]))
    .minute(Number((first?.endTime ?? "18:00").split(":")[1] ?? 0))
    .second(0);
  return { from, to };
};
