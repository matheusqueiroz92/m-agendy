import { ForbiddenError, UnauthorizedError } from "@/core/shared/domain/errors";

import { AuthenticatedActor } from "../domain/authenticated-actor";

/**
 * Serviço de autorização (puro). Centraliza as decisões de permissão para que
 * nenhum caso de uso reimplemente regras de acesso ad-hoc.
 *
 * Os métodos `assert*` lançam DomainError (Unauthorized/Forbidden), que a borda
 * já sabe traduzir para o usuário; os métodos `can*` retornam boolean para uso
 * em UI/condições.
 */
export class Authorizer {
  /** Garante que há um usuário autenticado e o estreita o tipo. */
  assertAuthenticated(
    actor: AuthenticatedActor | null,
  ): asserts actor is AuthenticatedActor {
    if (!actor) {
      throw new UnauthorizedError();
    }
  }

  /** Apenas o admin de plataforma (você, desenvolvedor) passa. */
  assertPlatformAdmin(actor: AuthenticatedActor | null): void {
    this.assertAuthenticated(actor);
    if (!actor.isPlatformAdmin()) {
      throw new ForbiddenError(
        "Esta ação é restrita ao administrador da plataforma.",
      );
    }
  }

  /** Membro (qualquer papel) da clínica, ou admin de plataforma. */
  assertMemberOfClinic(
    actor: AuthenticatedActor | null,
    clinicId: string,
  ): void {
    this.assertAuthenticated(actor);
    if (actor.isPlatformAdmin() || actor.isMemberOf(clinicId)) {
      return;
    }
    throw new ForbiddenError();
  }

  /** Gestor/owner da clínica, ou admin de plataforma. */
  assertCanManageClinic(
    actor: AuthenticatedActor | null,
    clinicId: string,
  ): void {
    this.assertAuthenticated(actor);
    if (!actor.canManageClinic(clinicId)) {
      throw new ForbiddenError();
    }
  }

  canManageClinic(
    actor: AuthenticatedActor | null,
    clinicId: string,
  ): boolean {
    return actor?.canManageClinic(clinicId) ?? false;
  }

  /**
   * Acesso a dados clínicos (prontuário): owner/manager/professional ou admin de
   * plataforma. O papel "staff" (recepção) é barrado — separa dados sensíveis de
   * saúde do operacional de agenda. (LGPD: mínimo necessário.)
   */
  assertCanAccessClinicalData(
    actor: AuthenticatedActor | null,
    clinicId: string,
  ): void {
    this.assertAuthenticated(actor);
    if (!actor.canAccessClinicalData(clinicId)) {
      throw new ForbiddenError(
        "Seu perfil não tem acesso aos dados clínicos do paciente.",
      );
    }
  }

  canAccessClinicalData(
    actor: AuthenticatedActor | null,
    clinicId: string,
  ): boolean {
    return actor?.canAccessClinicalData(clinicId) ?? false;
  }
}
