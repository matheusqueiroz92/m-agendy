"use client";

import { useQuery } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

import { getAvailableTimeSlots } from "@/actions/get-available-time-slots";

interface UseAvailableTimeSlotsProps {
  doctorId?: string;
  date?: Date;
  enabled?: boolean;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export function useAvailableTimeSlots({
  doctorId,
  date,
  enabled = true,
}: UseAvailableTimeSlotsProps) {
  const getTimeSlotsAction = useAction(getAvailableTimeSlots);

  const dateString = date ? date.toISOString().split("T")[0] : undefined;

  return useQuery({
    queryKey: ["available-time-slots", doctorId, dateString],
    queryFn: async (): Promise<TimeSlot[]> => {
      if (!doctorId || !dateString) {
        throw new Error("Doctor ID and date are required");
      }

      const result = await getTimeSlotsAction.executeAsync({
        doctorId,
        date: dateString,
      });

      if (result?.serverError) {
        throw new Error(result.serverError);
      }

      if (result?.validationErrors) {
        throw new Error("Validation error");
      }

      return result?.data?.timeSlots || [];
    },
    enabled: enabled && !!doctorId && !!dateString,
    staleTime: 1000 * 60 * 2, // 2 minutos (menor que o padrão para dados mais críticos)
    gcTime: 1000 * 60 * 5, // 5 minutos
  });
}
