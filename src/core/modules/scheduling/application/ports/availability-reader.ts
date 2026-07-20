import {
  OccupiedInterval,
  ProfessionalAvailability,
} from "../../domain/availability";

export interface ProfessionalAvailabilityInfo {
  windows: ProfessionalAvailability;
  defaultAppointmentDurationInMinutes: number;
}

/**
 * Porta de leitura para o cálculo de horários disponíveis: expõe as janelas de
 * atendimento do profissional e os intervalos já ocupados numa data.
 */
export interface AvailabilityReader {
  getAvailability(params: {
    clinicId: string;
    doctorId: string;
  }): Promise<ProfessionalAvailabilityInfo | null>;

  getOccupiedIntervals(params: {
    clinicId: string;
    doctorId: string;
    date: string;
  }): Promise<OccupiedInterval[]>;
}
