"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useRef } from "react";

import { cn } from "@/lib/utils";

import {
  DAY_END_HOUR,
  DAY_START_HOUR,
  SLOT_HEIGHT_PX,
  SLOT_MINUTES,
  formatTimeRange,
  heightForDuration,
  snapMinutes,
  topForDate,
} from "./schedule-constants";

export interface ScheduleAppointment {
  id: string;
  date: Date;
  durationInMinutes: number;
  status: "pending" | "confirmed" | "cancelled" | "no_show";
  patientName: string;
  doctorId: string;
  appointmentPriceInCents: number;
  type: "consultation" | "return_visit";
  patientId: string;
}

interface AppointmentBlockProps {
  appointment: ScheduleAppointment;
  onClick: () => void;
  onResizeEnd: (durationInMinutes: number) => void;
  maxDurationMinutes?: number;
}

export function AppointmentBlock({
  appointment,
  onClick,
  onResizeEnd,
  maxDurationMinutes = (DAY_END_HOUR - DAY_START_HOUR) * 60,
}: AppointmentBlockProps) {
  const dragStarted = useRef(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: appointment.id,
      data: { appointment },
    });

  const top = topForDate(appointment.date);
  const height = heightForDuration(appointment.durationInMinutes);

  const style: React.CSSProperties = {
    top,
    height: Math.max(height, SLOT_HEIGHT_PX),
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 40 : 10,
  };

  const handleResizePointerDown = (event: React.PointerEvent) => {
    event.stopPropagation();
    event.preventDefault();
    const startY = event.clientY;
    const startDuration = appointment.durationInMinutes;
    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture(event.pointerId);

    const onMove = (moveEvent: PointerEvent) => {
      const deltaSlots = Math.round(
        (moveEvent.clientY - startY) / SLOT_HEIGHT_PX,
      );
      const next = Math.max(
        SLOT_MINUTES,
        Math.min(
          maxDurationMinutes,
          snapMinutes(startDuration + deltaSlots * SLOT_MINUTES),
        ),
      );
      target.dataset.previewDuration = String(next);
      const block = target.parentElement;
      if (block) {
        block.style.height = `${heightForDuration(next)}px`;
      }
    };

    const onUp = (upEvent: PointerEvent) => {
      target.releasePointerCapture(upEvent.pointerId);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      const preview = Number(target.dataset.previewDuration ?? startDuration);
      if (preview !== startDuration) {
        onResizeEnd(preview);
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "absolute right-1 left-1 overflow-hidden rounded-md border border-[var(--cta)]/40 bg-[var(--cta)]/10 px-1.5 py-1 text-left shadow-sm",
        appointment.status === "confirmed" && "bg-[var(--cta)]/20",
        isDragging && "opacity-80 shadow-md",
      )}
      {...listeners}
      {...attributes}
      onPointerDown={(e) => {
        dragStarted.current = false;
        listeners?.onPointerDown?.(e as never);
      }}
      onPointerMove={() => {
        dragStarted.current = true;
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!dragStarted.current) {
          onClick();
        }
      }}
    >
      <p className="truncate text-[10px] font-medium leading-tight text-[var(--cta)]">
        {formatTimeRange(appointment.date, appointment.durationInMinutes)}
      </p>
      <p className="truncate text-[11px] font-semibold leading-tight">
        {appointment.patientName}
      </p>
      <div
        className="absolute inset-x-0 bottom-0 flex h-2 cursor-ns-resize items-end justify-center"
        onPointerDown={handleResizePointerDown}
      >
        <span className="mb-0.5 h-0.5 w-6 rounded-full bg-foreground/40" />
      </div>
    </div>
  );
}
