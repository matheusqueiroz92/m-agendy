import { OccupiedInterval } from "../../domain/availability";
import {
  AvailabilityReader,
  ProfessionalAvailabilityInfo,
} from "../ports/availability-reader";

/** Fake do AvailabilityReader para testes unitários. */
export class FakeAvailabilityReader implements AvailabilityReader {
  private availability: ProfessionalAvailabilityInfo | null = {
    windows: [
      { weekDay: 1, startTime: "08:00:00", endTime: "10:00:00" },
      { weekDay: 2, startTime: "08:00:00", endTime: "10:00:00" },
      { weekDay: 3, startTime: "08:00:00", endTime: "10:00:00" },
      { weekDay: 4, startTime: "08:00:00", endTime: "10:00:00" },
      { weekDay: 5, startTime: "08:00:00", endTime: "10:00:00" },
    ],
    defaultAppointmentDurationInMinutes: 30,
  };

  private occupied: OccupiedInterval[] = [];

  setAvailability(availability: ProfessionalAvailabilityInfo | null) {
    this.availability = availability;
  }

  setOccupied(occupied: OccupiedInterval[]) {
    this.occupied = occupied;
  }

  async getAvailability(): Promise<ProfessionalAvailabilityInfo | null> {
    return this.availability;
  }

  async getOccupiedIntervals(): Promise<OccupiedInterval[]> {
    return this.occupied;
  }
}
