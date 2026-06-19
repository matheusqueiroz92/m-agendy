import { ProfessionalAvailability } from "../../domain/availability";
import { AvailabilityReader } from "../ports/availability-reader";

/** AvailabilityReader fake, configurável nos testes. */
export class FakeAvailabilityReader implements AvailabilityReader {
  constructor(
    private availability: ProfessionalAvailability | null = {
      availableFromWeekDay: 1,
      availableToWeekDay: 5,
      availableFromTime: "08:00:00",
      availableToTime: "10:00:00",
    },
    private bookedTimes: string[] = [],
  ) {}

  setAvailability(availability: ProfessionalAvailability | null) {
    this.availability = availability;
  }

  setBookedTimes(times: string[]) {
    this.bookedTimes = times;
  }

  async getAvailability(): Promise<ProfessionalAvailability | null> {
    return this.availability;
  }

  async getBookedTimes(): Promise<string[]> {
    return this.bookedTimes;
  }
}
