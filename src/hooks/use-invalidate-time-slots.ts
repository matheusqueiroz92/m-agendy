"use client";

import { useQueryClient } from "@tanstack/react-query";

export function useInvalidateTimeSlots() {
  const queryClient = useQueryClient();

  const invalidateTimeSlots = (doctorId?: string, date?: Date | undefined) => {
    if (doctorId && date) {
      const dateString = date.toISOString().split("T")[0];
      // Invalidar cache específico
      queryClient.invalidateQueries({
        queryKey: ["available-time-slots", doctorId, dateString],
      });
    } else {
      // Invalidar todos os caches de horários se não tiver dados específicos
      queryClient.invalidateQueries({
        queryKey: ["available-time-slots"],
      });
    }
  };

  return { invalidateTimeSlots };
}
