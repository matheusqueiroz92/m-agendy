import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { AuditLog } from "@/core/shared/application/ports/audit-log";
import { NotFoundError } from "@/core/shared/domain/errors";

import { MedicalRecord } from "../../domain/medical-record";
import { MedicalRecordRepository } from "../ports/medical-record-repository";
import { PatientAccessChecker } from "../ports/patient-access";

export interface UpsertMedicalRecordInput {
  actor: AuthenticatedActor | null;
  clinicId: string;
  patientId: string;
  bloodType?: string;
  allergies?: string;
  medicationsInUse?: string;
  clinicalHistory?: string;
  surgicalHistory?: string;
  familyHistory?: string;
  habits?: string;
  notes?: string;
}

/**
 * Cria/atualiza os antecedentes do paciente. Exige que o ator seja membro da
 * clínica (médicos/profissionais registram dados clínicos), garante o
 * isolamento por clínica e registra auditoria (dado sensível — LGPD).
 */
export class UpsertMedicalRecordUseCase {
  constructor(
    private readonly records: MedicalRecordRepository,
    private readonly patientAccess: PatientAccessChecker,
    private readonly authorizer: Authorizer,
    private readonly audit: AuditLog,
  ) {}

  async execute(input: UpsertMedicalRecordInput): Promise<void> {
    this.authorizer.assertCanAccessClinicalData(input.actor, input.clinicId);

    const belongs = await this.patientAccess.belongsToClinic({
      patientId: input.patientId,
      clinicId: input.clinicId,
    });

    if (!belongs) {
      throw new NotFoundError("Paciente não encontrado.");
    }

    const record = MedicalRecord.create({
      patientId: input.patientId,
      clinicId: input.clinicId,
      bloodType: input.bloodType,
      allergies: input.allergies,
      medicationsInUse: input.medicationsInUse,
      clinicalHistory: input.clinicalHistory,
      surgicalHistory: input.surgicalHistory,
      familyHistory: input.familyHistory,
      habits: input.habits,
      notes: input.notes,
    });

    await this.records.save(record);

    await this.audit.record({
      clinicId: input.clinicId,
      actorUserId: input.actor?.userId,
      action: "medical_record.updated",
      entityType: "medical_record",
      entityId: input.patientId,
    });
  }
}
