"use client";

import { useQueryClient } from "@tanstack/react-query";

export function useInvalidateAppointments() {
  const queryClient = useQueryClient();

  const invalidateAppointments = () => {
    // Invalidar todos os caches relacionados a agendamentos
    queryClient.invalidateQueries({
      queryKey: ["available-time-slots"],
    });
  };

  return { invalidateAppointments };
}
