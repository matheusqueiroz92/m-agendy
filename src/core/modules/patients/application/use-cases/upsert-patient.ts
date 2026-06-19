import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { AuditLog } from "@/core/shared/application/ports/audit-log";
import { NotFoundError } from "@/core/shared/domain/errors";

import { Patient, PatientSex } from "../../domain/patient";
import { PatientRepository } from "../ports/patient-repository";

export interface UpsertPatientInput {
  actor: AuthenticatedActor | null;
  clinicId: string;
  id?: string;
  name: string;
  email: string;
  phoneNumber: string;
  sex: PatientSex;
}

export interface UpsertPatientOutput {
  patientId: string;
}

/**
 * Cria ou atualiza um paciente. Exige papel de gestão na clínica (owner/manager
 * ou admin de plataforma), garante o isolamento por clínica e registra auditoria.
 */
export class UpsertPatientUseCase {
  constructor(
    private readonly patients: PatientRepository,
    private readonly authorizer: Authorizer,
    private readonly audit: AuditLog,
  ) {}

  async execute(input: UpsertPatientInput): Promise<UpsertPatientOutput> {
    this.authorizer.assertCanManageClinic(input.actor, input.clinicId);

    // Em edição, garante que o paciente existe e pertence à clínica (tenant-safe).
    if (input.id) {
      const existing = await this.patients.findById(input.id);
      if (!existing || existing.clinicId !== input.clinicId) {
        throw new NotFoundError("Paciente não encontrado.");
      }
    }

    const patient = Patient.create({
      id: input.id,
      clinicId: input.clinicId,
      name: input.name,
      email: input.email,
      phoneNumber: input.phoneNumber,
      sex: input.sex,
    });

    await this.patients.save(patient);

    await this.audit.record({
      clinicId: input.clinicId,
      actorUserId: input.actor?.userId,
      action: input.id ? "patient.updated" : "patient.created",
      entityType: "patient",
      entityId: patient.id,
    });

    return { patientId: patient.id };
  }
}
