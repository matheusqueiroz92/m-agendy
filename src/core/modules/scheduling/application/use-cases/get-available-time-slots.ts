import { NotFoundError } from "@/core/shared/domain/errors";

import { computeAvailableSlots, TimeSlot } from "../../domain/availability";
import { AvailabilityReader } from "../ports/availability-reader";

export interface GetAvailableTimeSlotsInput {
  clinicId: string;
  doctorId: string;
  date: string; // "YYYY-MM-DD"
  /** Duração desejada da consulta; default = do profissional. */
  durationInMinutes?: number;
}

export interface GetAvailableTimeSlotsOutput {
  timeSlots: TimeSlot[];
}

/**
 * Calcula os horários disponíveis de um profissional numa data, combinando as
 * janelas de atendimento com os intervalos já ocupados.
 */
export class GetAvailableTimeSlotsUseCase {
  constructor(private readonly reader: AvailabilityReader) {}

  async execute(
    input: GetAvailableTimeSlotsInput,
  ): Promise<GetAvailableTimeSlotsOutput> {
    const availability = await this.reader.getAvailability({
      clinicId: input.clinicId,
      doctorId: input.doctorId,
    });

    if (!availability) {
      throw new NotFoundError("Profissional não encontrado.");
    }

    const occupied = await this.reader.getOccupiedIntervals({
      clinicId: input.clinicId,
      doctorId: input.doctorId,
      date: input.date,
    });

    const duration =
      input.durationInMinutes ??
      availability.defaultAppointmentDurationInMinutes;

    return {
      timeSlots: computeAvailableSlots(
        input.date,
        availability.windows,
        occupied,
        duration,
      ),
    };
  }
}
