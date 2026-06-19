"use client";

import { getProfessionalLabels } from "@/core/modules/clinics/domain/clinic-type";
import { authClient } from "@/lib/auth-client";

/**
 * Hook client que devolve os rótulos do profissional conforme o tipo da clínica
 * atual (ex.: "Médico"/"Médicos", "Dentista"/"Dentistas"). Centraliza a leitura
 * da sessão para os componentes não repetirem a lógica.
 */
export const useProfessionalLabels = () => {
  const { data } = authClient.useSession();
  return getProfessionalLabels(data?.user?.clinic?.type);
};
