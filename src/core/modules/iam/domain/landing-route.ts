export interface LandingContext {
  /** É admin de plataforma (operador do SaaS). */
  isPlatformAdmin: boolean;
  /** A clínica do usuário está bloqueada pela plataforma. */
  isClinicBlocked: boolean;
  /** O usuário pertence a alguma clínica (equipe). */
  hasClinic: boolean;
  /** A conta/clínica tem um plano ativo. */
  hasPlan: boolean;
  /** A conta está vinculada a um registro de paciente. */
  isPatient: boolean;
}

/**
 * Decide para onde enviar o usuário após o login, de forma pura/testável:
 * - Admin de plataforma: área da plataforma (precedência máxima).
 * - Clínica bloqueada: tela de suspensão (antes de qualquer regra de plano).
 * - Equipe de clínica: dashboard (ou assinatura, se sem plano).
 * - Paciente (sem clínica): portal do paciente.
 * - Sem clínica e sem cadastro de paciente: criar clínica (onboarding).
 */
export const resolveLandingRoute = (ctx: LandingContext): string => {
  if (ctx.isPlatformAdmin) {
    return "/platform";
  }
  if (ctx.isClinicBlocked) {
    return "/clinic-suspended";
  }
  if (ctx.hasClinic) {
    return ctx.hasPlan ? "/dashboard" : "/new-subscription";
  }
  if (ctx.isPatient) {
    return "/portal";
  }
  return "/clinic-form";
};
