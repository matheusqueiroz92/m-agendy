"use client";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { cn } from "@/lib/utils";
import {
  isWithinAvailability,
  timeToMinutes,
} from "@/core/modules/scheduling/domain/availability";

import {
  AppointmentBlock,
  ScheduleAppointment,
} from "./appointment-block";
import {
  DAY_END_HOUR,
  DAY_START_HOUR,
  GRID_HEIGHT_PX,
  SLOT_HEIGHT_PX,
  SLOT_MINUTES,
  TOTAL_SLOTS,
  dateFromDayAndOffset,
  formatDayHeader,
  isSameDay,
  minutesFromDayStart,
  snapMinutes,
  topForDate,
} from "./schedule-constants";

interface AvailabilityWindow {
  weekDay: number;
  startTime: string;
  endTime: string;
}

interface ScheduleGridProps {
  days: Date[];
  appointments: ScheduleAppointment[];
  windows: AvailabilityWindow[];
  onEmptySlotClick: (day: Date, time: string) => void;
  onAppointmentClick: (appointment: ScheduleAppointment) => void;
  onReschedule: (
    appointmentId: string,
    scheduledAt: Date,
    durationInMinutes: number,
  ) => void;
}

const timeLabels = Array.from({ length: TOTAL_SLOTS }, (_, i) => {
  const total = DAY_START_HOUR * 60 + i * SLOT_MINUTES;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return {
    label: m === 0 ? `${String(h).padStart(2, "0")}:00` : "",
    isHour: m === 0,
  };
});

function isSlotAvailable(
  day: Date,
  slotIndex: number,
  windows: AvailabilityWindow[],
) {
  const start = dateFromDayAndOffset(day, slotIndex * SLOT_MINUTES);
  return isWithinAvailability(start, SLOT_MINUTES, windows);
}

export function ScheduleGrid({
  days,
  appointments,
  windows,
  onEmptySlotClick,
  onAppointmentClick,
  onReschedule,
}: ScheduleGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );
  const now = new Date();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const appointment = appointments.find((a) => a.id === active.id);
    if (!appointment) return;

    const dayIndex = days.findIndex((d) => isSameDay(d, appointment.date));
    if (dayIndex < 0) return;

    // Com `display: contents` o wrapper não tem largura — resolve o dia
    // pelo centro do bloco arrastado sobre as colunas `[data-day]`.
    const translated = active.rect.current.translated;
    const columns = Array.from(
      document.querySelectorAll<HTMLElement>("[data-day]"),
    );
    let newDayIndex = dayIndex;
    if (translated && columns.length > 0) {
      const centerX = translated.left + translated.width / 2;
      const hitIndex = columns.findIndex((column) => {
        const rect = column.getBoundingClientRect();
        return centerX >= rect.left && centerX < rect.right;
      });
      if (hitIndex >= 0) {
        newDayIndex = hitIndex;
      } else {
        // Fallback: deslocamento horizontal em relação à largura da coluna de origem
        const originWidth =
          columns[dayIndex]?.getBoundingClientRect().width ?? 0;
        if (originWidth > 0) {
          newDayIndex = Math.min(
            days.length - 1,
            Math.max(0, dayIndex + Math.round(delta.x / originWidth)),
          );
        }
      }
    }

    const targetDay = days[newDayIndex];

    const currentOffset = minutesFromDayStart(
      appointment.date.getHours(),
      appointment.date.getMinutes(),
    );
    const minuteDelta = snapMinutes(
      Math.round(delta.y / SLOT_HEIGHT_PX) * SLOT_MINUTES,
    );
    const maxOffset =
      (DAY_END_HOUR - DAY_START_HOUR) * 60 - appointment.durationInMinutes;
    const nextOffset = Math.min(
      maxOffset,
      Math.max(0, currentOffset + minuteDelta),
    );
    const scheduledAt = dateFromDayAndOffset(targetDay, nextOffset);

    if (
      !isWithinAvailability(
        scheduledAt,
        appointment.durationInMinutes,
        windows,
      )
    ) {
      return;
    }

    if (scheduledAt.getTime() === appointment.date.getTime()) {
      return;
    }

    onReschedule(
      appointment.id,
      scheduledAt,
      appointment.durationInMinutes,
    );
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="overflow-x-auto rounded-lg border">
        <div
          className="grid min-w-[640px]"
          style={{
            gridTemplateColumns: `56px repeat(${days.length}, minmax(0, 1fr))`,
          }}
        >
          <div className="bg-muted/40 border-b" />
          {days.map((day) => (
            <div
              key={`header-${day.toISOString()}`}
              className={cn(
                "border-b border-l px-2 py-2 text-center text-xs font-medium",
                isSameDay(day, now) && "bg-[var(--cta)]/5 text-[var(--cta)]",
              )}
            >
              {formatDayHeader(day)}
            </div>
          ))}

          <div className="relative border-r" style={{ height: GRID_HEIGHT_PX }}>
            {timeLabels.map((slot, index) => (
              <div
                key={index}
                className={cn(
                  "absolute right-1 left-0 text-[10px] text-muted-foreground",
                  slot.isHour && "font-medium",
                )}
                style={{ top: index * SLOT_HEIGHT_PX - 6 }}
              >
                {slot.label}
              </div>
            ))}
          </div>

          {days.map((day) => {
              const dayAppointments = appointments.filter((a) =>
                isSameDay(a.date, day),
              );
              const showNow = isSameDay(day, now);
              const nowTop =
                showNow &&
                now.getHours() >= DAY_START_HOUR &&
                now.getHours() < DAY_END_HOUR
                  ? topForDate(now)
                  : null;

              return (
                <div
                  key={`col-${day.toISOString()}`}
                  className="relative border-l"
                  style={{ height: GRID_HEIGHT_PX }}
                  data-day={day.toISOString()}
                >
                  {Array.from({ length: TOTAL_SLOTS }, (_, slotIndex) => {
                    const available = isSlotAvailable(day, slotIndex, windows);
                    const isHour = slotIndex % 4 === 0;
                    return (
                      <button
                        key={slotIndex}
                        type="button"
                        disabled={!available}
                        className={cn(
                          "absolute inset-x-0 w-full border-t",
                          isHour ? "border-border" : "border-dashed border-border/50",
                          available
                            ? "hover:bg-[var(--cta)]/5"
                            : "cursor-not-allowed bg-muted/50",
                        )}
                        style={{
                          top: slotIndex * SLOT_HEIGHT_PX,
                          height: SLOT_HEIGHT_PX,
                        }}
                        onClick={() => {
                          if (!available) return;
                          const start = dateFromDayAndOffset(
                            day,
                            slotIndex * SLOT_MINUTES,
                          );
                          const time = `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`;
                          onEmptySlotClick(day, time);
                        }}
                      />
                    );
                  })}

                  {nowTop !== null && (
                    <div
                      className="pointer-events-none absolute right-0 left-0 z-20 flex items-center"
                      style={{ top: nowTop }}
                    >
                      <span className="size-2 rounded-full bg-red-500" />
                      <span className="h-px flex-1 bg-red-500" />
                    </div>
                  )}

                  {dayAppointments.map((appointment) => {
                    const startMinutes = timeToMinutes(
                      `${String(appointment.date.getHours()).padStart(2, "0")}:${String(appointment.date.getMinutes()).padStart(2, "0")}`,
                    );
                    const dayEndMinutes = DAY_END_HOUR * 60;
                    const maxDuration = Math.max(
                      SLOT_MINUTES,
                      dayEndMinutes - startMinutes,
                    );

                    return (
                      <AppointmentBlock
                        key={appointment.id}
                        appointment={appointment}
                        maxDurationMinutes={maxDuration}
                        onClick={() => onAppointmentClick(appointment)}
                        onResizeEnd={(durationInMinutes) =>
                          onReschedule(
                            appointment.id,
                            appointment.date,
                            durationInMinutes,
                          )
                        }
                      />
                    );
                  })}
                </div>
              );
            })}
        </div>
      </div>
    </DndContext>
  );
}
