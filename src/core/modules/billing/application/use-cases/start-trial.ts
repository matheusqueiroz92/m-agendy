import { Clock } from "@/core/shared/application/ports/clock";
import { UnauthorizedError } from "@/core/shared/domain/errors";

import { getPlan, isValidPlan } from "../../domain/plans";
import { BillingValidationError } from "../../domain/errors";
import { TrialRepository } from "../ports/trial-repository";

export interface StartTrialInput {
  userId: string | null | undefined;
  plan: string;
}

export interface StartTrialOutput {
  plan: string;
  planExpiresAt: Date;
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;

/**
 * Inicia o teste grátis sem cartão de um plano (Essential/Premium — planos
 * com `trialDays` no catálogo). Regras:
 * - usuário precisa estar autenticado;
 * - plano precisa existir e oferecer trial self-service;
 * - usuário não pode já ter um plano ativo, nem já ter usado o trial antes
 *   (evita reiniciar o período grátis).
 *
 * Não depende de gateway de pagamento: grava o plano direto, com expiração.
 * Quando o trial vence, `resolveClinicAccess` deixa de considerar o plano
 * ativo (ver `clinics/domain/clinic-access.ts`).
 */
export class StartTrialUseCase {
  constructor(
    private readonly trials: TrialRepository,
    private readonly clock: Clock,
  ) {}

  async execute(input: StartTrialInput): Promise<StartTrialOutput> {
    if (!input.userId) {
      throw new UnauthorizedError();
    }

    if (!isValidPlan(input.plan)) {
      throw new BillingValidationError("Plano inválido.");
    }

    const planDef = getPlan(input.plan);
    if (!planDef?.trialDays) {
      throw new BillingValidationError(
        "Este plano não possui teste grátis disponível.",
      );
    }

    const eligibility = await this.trials.getEligibility(input.userId);

    if (eligibility.hasUsedTrial) {
      throw new BillingValidationError(
        "Você já utilizou seu teste grátis. Escolha um plano para assinar.",
      );
    }

    if (eligibility.plan) {
      throw new BillingValidationError("Você já possui um plano ativo.");
    }

    const now = this.clock.now();
    const planExpiresAt = new Date(now.getTime() + planDef.trialDays * DAY_IN_MS);

    await this.trials.start({
      userId: input.userId,
      plan: input.plan,
      expiresAt: planExpiresAt,
    });

    return { plan: input.plan, planExpiresAt };
  }
}
