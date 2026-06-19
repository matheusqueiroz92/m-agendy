import { NotFoundError } from "@/core/shared/domain/errors";

import { computeAvailableSlots, TimeSlot } from "../../domain/availability";
import { AvailabilityReader } from "../ports/availability-reader";

export interface GetAvailableTimeSlotsInput {
  clinicId: string;
  doctorId: string;
  date: string; // "YYYY-MM-DD"
}

export interface GetAvailableTimeSlotsOutput {
  timeSlots: TimeSlot[];
}

/**
 * Calcula os horários disponíveis de um profissional numa data, combinando a
 * janela de atendimento com os horários já ocupados. Usado tanto pelo painel
 * (gestão) quanto pelo agendamento online (público).
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

    const occupied = await this.reader.getBookedTimes({
      clinicId: input.clinicId,
      doctorId: input.doctorId,
      date: input.date,
    });

    return {
      timeSlots: computeAvailableSlots(input.date, availability, occupied),
    };
  }
}
