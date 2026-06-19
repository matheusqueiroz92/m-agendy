import {
  AppointmentContact,
  AppointmentContactDirectory,
} from "../ports/appointment-contact-directory";

/** Diretório de contatos fake, configurável nos testes. */
export class FakeAppointmentContactDirectory
  implements AppointmentContactDirectory
{
  constructor(private contact: AppointmentContact | null = null) {}

  setContact(contact: AppointmentContact | null) {
    this.contact = contact;
  }

  async getContact(): Promise<AppointmentContact | null> {
    return this.contact;
  }
}
