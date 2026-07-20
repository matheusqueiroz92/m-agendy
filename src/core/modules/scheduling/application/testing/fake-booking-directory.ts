import {
  BookableProfessional,
  BookingDirectory,
  FindOrCreatePatientInput,
} from "../ports/booking-directory";

/** BookingDirectory fake, configurável nos testes. */
export class FakeBookingDirectory implements BookingDirectory {
  public createdPatients: FindOrCreatePatientInput[] = [];

  constructor(
    private professional: BookableProfessional | null = {
      priceInCents: 20000,
      name: "Dr. House",
      defaultAppointmentDurationInMinutes: 30,
    },
    private patientId = "patient-1",
  ) {}

  setProfessional(professional: BookableProfessional | null) {
    this.professional = professional;
  }

  async getProfessional(): Promise<BookableProfessional | null> {
    return this.professional;
  }

  async findOrCreatePatient(input: FindOrCreatePatientInput): Promise<string> {
    this.createdPatients.push(input);
    return this.patientId;
  }
}
