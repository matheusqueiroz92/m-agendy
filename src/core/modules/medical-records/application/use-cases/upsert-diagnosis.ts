import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { AuditLog } from "@/core/shared/application/ports/audit-log";
import { NotFoundError } from "@/core/shared/domain/errors";

import { Diagnosis, DiagnosisStatus } from "../../domain/diagnosis";
import { DiagnosisRepository } from "../ports/diagnosis-repository";
import { PatientAccessChecker } from "../ports/patient-access";

export interface UpsertDiagnosisInput {
  actor: AuthenticatedActor | null;
  clinicId: string;
  id?: string;
  patientId: string;
  attendanceId?: string;
  description: string;
  cid10Code?: string;
  status: DiagnosisStatus;
  date: Date;
  notes?: string;
}

export interface UpsertDiagnosisOutput {
  diagnosisId: string;
}

/**
 * Cria/atualiza um diagnóstico. Exige membro da clínica, garante isolamento por
 * clínica e registra auditoria (dado clínico sensível).
 */
export class UpsertDiagnosisUseCase {
  constructor(
    private readonly diagnoses: DiagnosisRepository,
    private readonly patientAccess: PatientAccessChecker,
    private readonly authorizer: Authorizer,
    private readonly audit: AuditLog,
  ) {}

  async execute(input: UpsertDiagnosisInput): Promise<UpsertDiagnosisOutput> {
    this.authorizer.assertCanAccessClinicalData(input.actor, input.clinicId);

    if (input.id) {
      const existing = await this.diagnoses.findById(input.id);
      if (!existing || existing.clinicId !== input.clinicId) {
        throw new NotFoundError("Diagnóstico não encontrado.");
      }
    } else {
      const belongs = await this.patientAccess.belongsToClinic({
        patientId: input.patientId,
        clinicId: input.clinicId,
      });
      if (!belongs) {
        throw new NotFoundError("Paciente não encontrado.");
      }
    }

    const diagnosis = Diagnosis.create({
      id: input.id,
      clinicId: input.clinicId,
      patientId: input.patientId,
      attendanceId: input.attendanceId,
      description: input.description,
      cid10Code: input.cid10Code,
      status: input.status,
      date: input.date,
      notes: input.notes,
    });

    await this.diagnoses.save(diagnosis);

    await this.audit.record({
      clinicId: input.clinicId,
      actorUserId: input.actor?.userId,
      action: input.id ? "diagnosis.updated" : "diagnosis.created",
      entityType: "diagnosis",
      entityId: diagnosis.id,
      metadata: { patientId: input.patientId },
    });

    return { diagnosisId: diagnosis.id };
  }
}
