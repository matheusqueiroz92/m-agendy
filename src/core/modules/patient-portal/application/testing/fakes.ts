import {
  PatientAppointmentsReader,
  PortalAppointment,
} from "../ports/patient-appointments-reader";
import {
  PortalPatient,
  PortalPatientDirectory,
} from "../ports/portal-patient-directory";

/** Diretório de pacientes do portal, em memória, para testes. */
export class FakePortalPatientDirectory implements PortalPatientDirectory {
  /** Pacientes já vinculados, por userId. */
  public byUserId = new Map<string, PortalPatient>();
  /** Pacientes sem vínculo, por e-mail (candidatos a auto-vínculo). */
  public unlinkedByEmail = new Map<string, PortalPatient>();

  async findByUserId(userId: string): Promise<PortalPatient | null> {
    return this.byUserId.get(userId) ?? null;
  }

  async linkByEmail(params: {
    userId: string;
    email: string;
  }): Promise<PortalPatient | null> {
    const patient = this.unlinkedByEmail.get(params.email);
    if (!patient) return null;
    this.unlinkedByEmail.delete(params.email);
    this.byUserId.set(params.userId, patient);
    return patient;
  }
}

/** Leitor de consultas do portal, em memória, para testes. */
export class FakePatientAppointmentsReader
  implements PatientAppointmentsReader
{
  constructor(private readonly byPatient: Map<string, PortalAppointment[]>) {}

  async listByPatient(patientId: string): Promise<PortalAppointment[]> {
    return this.byPatient.get(patientId) ?? [];
  }
}
