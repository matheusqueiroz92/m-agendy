import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { AuditLog } from "@/core/shared/application/ports/audit-log";
import { NotFoundError } from "@/core/shared/domain/errors";

import { PatientAccessChecker } from "../ports/patient-access";

export interface LogMedicalRecordAccessInput {
  actor: AuthenticatedActor | null;
  clinicId: string;
  patientId: string;
}

/**
 * Autoriza e registra (LGPD) o acesso de LEITURA ao prontuário de um paciente.
 * Deve ser chamado ao abrir o prontuário: garante que o ator pode ver dados
 * clínicos (staff é barrado), valida o isolamento por clínica e grava trilha de
 * auditoria de quem acessou o quê e quando.
 */
export class LogMedicalRecordAccessUseCase {
  constructor(
    private readonly patientAccess: PatientAccessChecker,
    private readonly authorizer: Authorizer,
    private readonly audit: AuditLog,
  ) {}

  async execute(input: LogMedicalRecordAccessInput): Promise<void> {
    this.authorizer.assertCanAccessClinicalData(input.actor, input.clinicId);

    const belongs = await this.patientAccess.belongsToClinic({
      patientId: input.patientId,
      clinicId: input.clinicId,
    });
    if (!belongs) {
      throw new NotFoundError("Paciente não encontrado.");
    }

    await this.audit.record({
      clinicId: input.clinicId,
      actorUserId: input.actor?.userId,
      action: "medical_record.viewed",
      entityType: "medical_record",
      entityId: input.patientId,
    });
  }
}
