import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { AuditLog } from "@/core/shared/application/ports/audit-log";
import { NotFoundError } from "@/core/shared/domain/errors";

import { FollowUp, FollowUpStatus } from "../../domain/follow-up";
import { FollowUpRepository } from "../ports/follow-up-repository";
import { PatientAccessChecker } from "../ports/patient-access";

export interface UpsertFollowUpInput {
  actor: AuthenticatedActor | null;
  clinicId: string;
  id?: string;
  patientId: string;
  title: string;
  description?: string;
  status: FollowUpStatus;
  scheduledDate?: Date;
  completedDate?: Date;
}

export interface UpsertFollowUpOutput {
  followUpId: string;
}

/**
 * Cria/atualiza um acompanhamento. Exige membro da clínica, garante isolamento
 * por clínica e registra auditoria.
 */
export class UpsertFollowUpUseCase {
  constructor(
    private readonly followUps: FollowUpRepository,
    private readonly patientAccess: PatientAccessChecker,
    private readonly authorizer: Authorizer,
    private readonly audit: AuditLog,
  ) {}

  async execute(input: UpsertFollowUpInput): Promise<UpsertFollowUpOutput> {
    this.authorizer.assertCanAccessClinicalData(input.actor, input.clinicId);

    if (input.id) {
      const existing = await this.followUps.findById(input.id);
      if (!existing || existing.clinicId !== input.clinicId) {
        throw new NotFoundError("Acompanhamento não encontrado.");
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

    const followUp = FollowUp.create({
      id: input.id,
      clinicId: input.clinicId,
      patientId: input.patientId,
      title: input.title,
      description: input.description,
      status: input.status,
      scheduledDate: input.scheduledDate,
      completedDate: input.completedDate,
    });

    await this.followUps.save(followUp);

    await this.audit.record({
      clinicId: input.clinicId,
      actorUserId: input.actor?.userId,
      action: input.id ? "follow_up.updated" : "follow_up.created",
      entityType: "follow_up",
      entityId: followUp.id,
      metadata: { patientId: input.patientId },
    });

    return { followUpId: followUp.id };
  }
}
