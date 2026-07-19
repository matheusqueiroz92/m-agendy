import { ClinicType } from "../../domain/clinic-type";
import { ClinicStatus } from "../../domain/clinic-access";

/** Item da listagem administrativa de clínicas (read model). */
export interface AdminClinicListItem {
  id: string;
  name: string;
  type: ClinicType;
  status: ClinicStatus;
  blockedReason: string | null;
  planOverride: string | null;
  planOverrideExpiresAt: Date | null;
  /** Plano "de base" (assinatura do dono, via gateway). */
  basePlan: string | null;
  ownerName: string | null;
  ownerEmail: string | null;
  createdAt: Date;
  patientsCount: number;
  doctorsCount: number;
  appointmentsCount: number;
  membersCount: number;
}

/**
 * Porta de gestão de clínicas pela plataforma (admin). Concentra leitura
 * detalhada e mutações administrativas, sem acoplar ao Drizzle.
 */
export interface AdminClinicRepository {
  listAll(): Promise<AdminClinicListItem[]>;
  exists(id: string): Promise<boolean>;
  create(data: { name: string; type: ClinicType }): Promise<{ id: string }>;
  update(id: string, data: { name: string; type: ClinicType }): Promise<void>;
  delete(id: string): Promise<void>;
  /** Vincula o usuário como responsável ("owner") pela clínica. */
  linkOwner(clinicId: string, userId: string): Promise<void>;
  setStatus(
    id: string,
    status: ClinicStatus,
    reason: string | null,
  ): Promise<void>;
  setPlanOverride(
    id: string,
    planOverride: string | null,
    expiresAt: Date | null,
  ): Promise<void>;
}
