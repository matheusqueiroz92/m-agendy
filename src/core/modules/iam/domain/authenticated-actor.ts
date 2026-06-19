import {
  CLINIC_MANAGEMENT_ROLES,
  CLINICAL_DATA_ROLES,
  ClinicRole,
  PlatformRole,
} from "./roles";

export interface ClinicMembership {
  clinicId: string;
  role: ClinicRole;
}

export interface AuthenticatedActorProps {
  userId: string;
  platformRole: PlatformRole;
  memberships: ClinicMembership[];
}

/**
 * Representa o usuário autenticado e seus papéis — na plataforma e em cada
 * clínica. É um value object puro: não conhece BetterAuth nem HTTP. As decisões
 * de permissão ficam no Authorizer; aqui ficam apenas consultas sobre o ator.
 */
export class AuthenticatedActor {
  constructor(private readonly props: AuthenticatedActorProps) {}

  get userId(): string {
    return this.props.userId;
  }

  get platformRole(): PlatformRole {
    return this.props.platformRole;
  }

  get memberships(): ClinicMembership[] {
    return this.props.memberships;
  }

  isPlatformAdmin(): boolean {
    return this.props.platformRole === "platform_admin";
  }

  roleInClinic(clinicId: string): ClinicRole | null {
    return (
      this.props.memberships.find((m) => m.clinicId === clinicId)?.role ?? null
    );
  }

  isMemberOf(clinicId: string): boolean {
    return this.roleInClinic(clinicId) !== null;
  }

  canManageClinic(clinicId: string): boolean {
    if (this.isPlatformAdmin()) return true;
    const role = this.roleInClinic(clinicId);
    return role !== null && CLINIC_MANAGEMENT_ROLES.includes(role);
  }

  /** Pode acessar dados clínicos (prontuário)? "staff" não pode. */
  canAccessClinicalData(clinicId: string): boolean {
    if (this.isPlatformAdmin()) return true;
    const role = this.roleInClinic(clinicId);
    return role !== null && CLINICAL_DATA_ROLES.includes(role);
  }
}
