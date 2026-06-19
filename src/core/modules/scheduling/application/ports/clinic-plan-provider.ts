/**
 * Resolve o plano efetivo de uma clínica (cortesia/override > assinatura, e
 * null se bloqueada). Usado pelos fluxos SEM sessão (link público e chatbot)
 * para aplicar os limites do plano.
 */
export interface ClinicPlanProvider {
  getEffectivePlan(clinicId: string): Promise<string | null>;
}
