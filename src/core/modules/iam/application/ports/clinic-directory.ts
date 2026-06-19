export interface ClinicSummary {
  id: string;
  name: string;
  createdAt: Date;
  patientsCount: number;
  doctorsCount: number;
  appointmentsCount: number;
  membersCount: number;
}

/**
 * Porta de leitura para o painel de administração de plataforma: lista todas as
 * clínicas do sistema com estatísticas resumidas.
 */
export interface ClinicDirectory {
  listAllWithStats(): Promise<ClinicSummary[]>;
}
