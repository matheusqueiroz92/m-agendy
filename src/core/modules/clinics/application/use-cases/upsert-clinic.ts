import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { ClinicNotifier } from "@/core/modules/scheduling/application/ports/clinic-notifier";
import { AuditLog } from "@/core/shared/application/ports/audit-log";
import { NotFoundError } from "@/core/shared/domain/errors";

import { ClinicType } from "../../domain/clinic-type";
import { ClinicValidationError } from "../../domain/errors";
import { AdminClinicRepository } from "../ports/admin-clinic-repository";
import { ClinicOwnerProvisioner } from "../ports/clinic-owner-provisioner";

export interface UpsertClinicInput {
  actor: AuthenticatedActor | null;
  id?: string;
  name: string;
  type: ClinicType;
  /** Responsável pela clínica — obrigatório apenas na criação (sem `id`). */
  ownerName?: string;
  ownerEmail?: string;
  ownerPhoneNumber?: string;
}

export interface UpsertClinicOutput {
  clinicId: string;
}

/**
 * Cria/edita uma clínica pela plataforma. Restrito ao admin de plataforma.
 *
 * Na criação, também provisiona (ou reaproveita) a conta do responsável e a
 * vincula como "owner" — sem isso a clínica ficaria sem ninguém capaz de
 * logar nela. Se o provisionamento falhar, a clínica recém-criada é
 * revertida (nunca fica um registro pela metade). Na edição, o responsável
 * não é alterado por este caso de uso.
 */
export class UpsertClinicUseCase {
  constructor(
    private readonly clinics: AdminClinicRepository,
    private readonly authorizer: Authorizer,
    private readonly audit: AuditLog,
    private readonly owners: ClinicOwnerProvisioner,
    private readonly clinicNotifier: ClinicNotifier,
  ) {}

  async execute(input: UpsertClinicInput): Promise<UpsertClinicOutput> {
    this.authorizer.assertPlatformAdmin(input.actor);

    const name = input.name.trim();
    if (!name) {
      throw new ClinicValidationError("O nome da clínica é obrigatório.");
    }

    if (input.id) {
      return this.update(input.id, name, input);
    }
    return this.create(name, input);
  }

  private async update(
    id: string,
    name: string,
    input: UpsertClinicInput,
  ): Promise<UpsertClinicOutput> {
    if (!(await this.clinics.exists(id))) {
      throw new NotFoundError("Clínica não encontrada.");
    }
    await this.clinics.update(id, { name, type: input.type });

    await this.audit.record({
      clinicId: id,
      actorUserId: input.actor?.userId,
      action: "clinic.updated",
      entityType: "clinic",
      entityId: id,
    });

    return { clinicId: id };
  }

  private async create(
    name: string,
    input: UpsertClinicInput,
  ): Promise<UpsertClinicOutput> {
    const ownerName = input.ownerName?.trim();
    if (!ownerName) {
      throw new ClinicValidationError("O nome do responsável é obrigatório.");
    }
    const ownerEmail = input.ownerEmail?.trim();
    if (!ownerEmail) {
      throw new ClinicValidationError("O e-mail do responsável é obrigatório.");
    }

    const clinic = await this.clinics.create({ name, type: input.type });

    try {
      const { userId } = await this.owners.provision({
        name: ownerName,
        email: ownerEmail,
        phoneNumber: input.ownerPhoneNumber?.trim() || undefined,
      });
      await this.clinics.linkOwner(clinic.id, userId);
    } catch (error) {
      // Sem responsável a clínica é inacessível — reverte em vez de deixar
      // um registro órfão pela metade.
      await this.clinics.delete(clinic.id);
      throw error;
    }

    await this.audit.record({
      clinicId: clinic.id,
      actorUserId: input.actor?.userId,
      action: "clinic.created",
      entityType: "clinic",
      entityId: clinic.id,
    });

    // Aviso único (na criação): as mensagens saem com o número da
    // plataforma até a clínica integrar o próprio (Premium/Gold). Best-effort
    // — não desfaz a criação da clínica se a notificação falhar.
    try {
      await this.clinicNotifier.notifyWhatsAppSharedNumberDisclosure({
        clinicId: clinic.id,
      });
    } catch (error) {
      console.error(
        "[clinics] falha ao avisar sobre o número compartilhado:",
        error,
      );
    }

    return { clinicId: clinic.id };
  }
}
