export const PLATFORM_ROLES = ["platform_admin", "member"] as const;
export type PlatformRole = (typeof PLATFORM_ROLES)[number];

export const CLINIC_ROLES = [
  "owner",
  "manager",
  "professional",
  "staff",
] as const;
export type ClinicRole = (typeof CLINIC_ROLES)[number];

/** Papéis de clínica que podem gerenciar a clínica (configurações, equipe...). */
export const CLINIC_MANAGEMENT_ROLES: ClinicRole[] = ["owner", "manager"];

/** Papéis de clínica que podem acessar dados clínicos (prontuário). Exclui "staff". */
export const CLINICAL_DATA_ROLES: ClinicRole[] = [
  "owner",
  "manager",
  "professional",
];
