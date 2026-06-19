import { GetAvailableTimeSlotsUseCase } from "../../application/use-cases/get-available-time-slots";
import { DrizzleAvailabilityReader } from "../persistence/drizzle-availability-reader";

/** Composition root do cálculo de horários disponíveis. */
export const makeGetAvailableTimeSlots = () =>
  new GetAvailableTimeSlotsUseCase(new DrizzleAvailabilityReader());
