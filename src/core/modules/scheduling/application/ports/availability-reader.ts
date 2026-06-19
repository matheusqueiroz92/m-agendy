import { ProfessionalAvailability } from "../../domain/availability";

/**
 * Porta de leitura para o cálculo de horários disponíveis: expõe a janela de
 * atendimento do profissional e os horários já ocupados numa data.
 */
export interface AvailabilityReader {
  getAvailability(params: {
    clinicId: string;
    doctorId: string;
  }): Promise<ProfessionalAvailability | null>;

  /** Horários "HH:MM" já ocupados para o profissional na data "YYYY-MM-DD". */
  getBookedTimes(params: {
    clinicId: string;
    doctorId: string;
    date: string;
  }): Promise<string[]>;
}
