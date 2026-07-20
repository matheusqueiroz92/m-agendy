"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { formatPeriodLabel } from "./schedule-constants";

interface ScheduleBoardToolbarProps {
  doctors: { id: string; name: string }[];
  selectedDoctorId: string;
  onDoctorChange: (id: string) => void;
  mode: "day" | "week";
  onModeChange: (mode: "day" | "week") => void;
  visibleDays: Date[];
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  isMobile: boolean;
  leading?: ReactNode;
}

export function ScheduleBoardToolbar({
  doctors,
  selectedDoctorId,
  onDoctorChange,
  mode,
  onModeChange,
  visibleDays,
  onPrev,
  onNext,
  onToday,
  isMobile,
  leading,
}: ScheduleBoardToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
        {leading}
        <Select value={selectedDoctorId} onValueChange={onDoctorChange}>
          <SelectTrigger className="w-full sm:w-[260px]">
            <SelectValue placeholder="Selecione o profissional" />
          </SelectTrigger>
          <SelectContent>
            {doctors.map((doctor) => (
              <SelectItem key={doctor.id} value={doctor.id}>
                {doctor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onPrev}
            aria-label="Anterior"
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onToday}>
            Hoje
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onNext}
            aria-label="Próximo"
          >
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>

        <span className="text-muted-foreground min-w-[140px] text-sm capitalize">
          {formatPeriodLabel(visibleDays, mode)}
        </span>

        {!isMobile && (
          <div className="bg-muted flex rounded-md p-0.5">
            <button
              type="button"
              className={cn(
                "rounded px-3 py-1 text-xs font-medium transition-colors",
                mode === "day"
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground",
              )}
              onClick={() => onModeChange("day")}
            >
              Dia
            </button>
            <button
              type="button"
              className={cn(
                "rounded px-3 py-1 text-xs font-medium transition-colors",
                mode === "week"
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground",
              )}
              onClick={() => onModeChange("week")}
            >
              Semana
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
