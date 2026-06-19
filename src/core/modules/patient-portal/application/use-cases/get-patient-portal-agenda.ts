import { Clock } from "@/core/shared/application/ports/clock";

import { PatientAppointmentsReader } from "../ports/patient-appointments-reader";
import { PortalAppointment } from "../ports/patient-appointments-reader";
import { PortalPatientDirectory } from "../ports/portal-patient-directory";

export interface GetPatientPortalAgendaInput {
  userId: string;
  email: string;
}

export interface GetPatientPortalAgendaOutput {
  /** Se a conta está vinculada a um paciente da plataforma. */
  linked: boolean;
  patientName: string | null;
  upcoming: PortalAppointment[];
  past: PortalAppointment[];
}

/**
 * Agenda do paciente no portal: resolve (e auto-vincula por e-mail) o paciente
 * da conta logada e devolve suas consultas separadas em próximas e passadas.
 * Acesso é "dado próprio" — escopado pelo userId, sem papéis de clínica.
 */
export class GetPatientPortalAgendaUseCase {
  constructor(
    private readonly patients: PortalPatientDirectory,
    private readonly appointments: PatientAppointmentsReader,
    private readonly clock: Clock,
  ) {}

  async execute(
    input: GetPatientPortalAgendaInput,
  ): Promise<GetPatientPortalAgendaOutput> {
    const patient =
      (await this.patients.findByUserId(input.userId)) ??
      (await this.patients.linkByEmail({
        userId: input.userId,
        email: input.email,
      }));

    if (!patient) {
      return { linked: false, patientName: null, upcoming: [], past: [] };
    }

    const all = await this.appointments.listByPatient(patient.id);
    const now = this.clock.now().getTime();

    const upcoming = all
      .filter((a) => a.scheduledAt.getTime() >= now)
      .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());

    const past = all
      .filter((a) => a.scheduledAt.getTime() < now)
      .sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime());

    return { linked: true, patientName: patient.name, upcoming, past };
  }
}
