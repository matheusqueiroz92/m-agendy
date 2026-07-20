import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { AuditLog } from "@/core/shared/application/ports/audit-log";
import { NotFoundError, PlanLimitError } from "@/core/shared/domain/errors";
import { canAddProfessional } from "@/core/modules/billing/domain/entitlements";
import { AvailabilityWindow } from "@/core/modules/scheduling/domain/availability";

import { Professional } from "../../domain/professional";
import { ProfessionalRepository } from "../ports/professional-repository";

export interface UpsertProfessionalInput {
  actor: AuthenticatedActor | null;
  clinicId: string;
  /** Plano efetivo da clínica (para aplicar limites). */
  plan?: string | null;
  id?: string;
  name: string;
  speciality: string;
  phoneNumber?: string | null;
  avatarImageUrl?: string | null;
  appointmentPriceInCents: number;
  defaultAppointmentDurationInMinutes: number;
  availabilityWindows: AvailabilityWindow[];
}

export interface UpsertProfessionalOutput {
  professionalId: string;
}

/**
 * Cria ou atualiza um profissional. Exige papel de gestão na clínica, garante
 * isolamento por clínica e registra auditoria.
 */
export class UpsertProfessionalUseCase {
  constructor(
    private readonly professionals: ProfessionalRepository,
    private readonly authorizer: Authorizer,
    private readonly audit: AuditLog,
  ) {}

  async execute(
    input: UpsertProfessionalInput,
  ): Promise<UpsertProfessionalOutput> {
    this.authorizer.assertCanManageClinic(input.actor, input.clinicId);

    if (input.id) {
      const existing = await this.professionals.findById(input.id);
      if (!existing || existing.clinicId !== input.clinicId) {
        throw new NotFoundError("Profissional não encontrado.");
      }
    } else {
      const current = await this.professionals.countByClinic(input.clinicId);
      if (input.plan && !canAddProfessional(input.plan, current)) {
        throw new PlanLimitError(
          "Seu plano atingiu o limite de profissionais. Faça upgrade para cadastrar mais.",
        );
      }
    }

    const professional = Professional.create({
      id: input.id,
      clinicId: input.clinicId,
      name: input.name,
      speciality: input.speciality,
      phoneNumber: input.phoneNumber,
      avatarImageUrl: input.avatarImageUrl,
      appointmentPriceInCents: input.appointmentPriceInCents,
      defaultAppointmentDurationInMinutes:
        input.defaultAppointmentDurationInMinutes,
      availabilityWindows: input.availabilityWindows,
    });

    await this.professionals.save(professional);

    await this.audit.record({
      clinicId: input.clinicId,
      actorUserId: input.actor?.userId,
      action: input.id ? "professional.updated" : "professional.created",
      entityType: "professional",
      entityId: professional.id,
    });

    return { professionalId: professional.id };
  }
}
