export const CLINIC_STATUSES = ["active", "blocked"] as const;
export type ClinicStatus = (typeof CLINIC_STATUSES)[number];

export interface ResolveClinicAccessInput {
  status: ClinicStatus;
  /** Override de plano concedido pela plataforma (ou null). */
  planOverride: string | null;
  /** Validade do override (ou null = sem expiração). */
  planOverrideExpiresAt: Date | null;
  /** Plano "de base" (ex.: o que veio do gateway, no dono da clínica). */
  basePlan: string | null;
  /**
   * Validade do plano de base (ou null = sem expiração). Hoje só é usado pelo
   * trial gratuito (`plan = 'trial'`); planos pagos via gateway não expiram
   * por aqui (o cancelamento chega pelo webhook e zera o `basePlan`).
   */
  basePlanExpiresAt: Date | null;
  now: Date;
}

export interface ClinicAccess {
  /** A clínica está bloqueada pela plataforma. */
  isBlocked: boolean;
  /** Plano em vigor (override válido tem precedência sobre o de base). */
  effectivePlan: string | null;
  /** Tem plano em vigor (libera o uso do painel). */
  hasActivePlan: boolean;
}

/**
 * Resolve o acesso de uma clínica de forma pura/testável.
 * Regras:
 * - bloqueada → sem acesso e sem plano efetivo;
 * - override de plano válido (não expirado) tem precedência sobre o plano base;
 * - sem override válido, vale o plano base — mas só enquanto não expirado
 *   (ex.: trial gratuito vencido deixa de contar como plano ativo).
 */
export const resolveClinicAccess = (
  input: ResolveClinicAccessInput,
): ClinicAccess => {
  if (input.status === "blocked") {
    return { isBlocked: true, effectivePlan: null, hasActivePlan: false };
  }

  const overrideActive =
    !!input.planOverride &&
    (input.planOverrideExpiresAt === null ||
      input.planOverrideExpiresAt.getTime() > input.now.getTime());

  const baseActive =
    !!input.basePlan &&
    (input.basePlanExpiresAt === null ||
      input.basePlanExpiresAt.getTime() > input.now.getTime());

  const effectivePlan = overrideActive
    ? input.planOverride
    : baseActive
      ? input.basePlan
      : null;

  return {
    isBlocked: false,
    effectivePlan,
    hasActivePlan: !!effectivePlan,
  };
};
