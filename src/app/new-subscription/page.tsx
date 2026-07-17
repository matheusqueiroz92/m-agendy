import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";

import { PLAN_CATALOG } from "@/core/modules/billing/domain/plans";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { PlanFeatures } from "../(protected)/_contants/plan-features";
import { SubscriptionPlan } from "../(protected)/subscription/_components/subscription-plan";

const NewSubscriptionPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }

  // Clínica bloqueada não deve cair na tela de assinatura: vai para a suspensão.
  if (
    (session.user.clinic as { status?: string } | undefined)?.status ===
    "blocked"
  ) {
    redirect("/clinic-suspended");
  }

  // O plano efetivo (session.user.plan) já reflete cortesia/trial vigente,
  // mas `hasUsedTrial` não é exposto na sessão — busca direto para decidir
  // quais planos ainda podem oferecer trial self-service a este usuário.
  const userRow = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, session.user.id),
  });

  const currentPlan = session.user.plan ?? null;
  const trialEligible = !currentPlan && !userRow?.hasUsedTrial;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12">
        {/* Logo */}
        <header className="mb-12 flex justify-center">
          <Image
            src="/images/logo-m-agendy-com-nome.png"
            alt="Logo M.Agendy"
            width={300}
            height={300}
            className="h-auto"
            priority
          />
        </header>

        {/* Título e sub-título */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h1 className="mb-4 text-3xl font-black text-gray-900">
            Transforme a gestão da sua empresa!
          </h1>
          <p className="text-muted-foreground mb-6text-lg">
            Para continuar utilizando nossa plataforma, escolha o plano que
            melhor se adapta às suas necessidades e otimize os agendamentos do
            seu negócio!
          </p>
        </div>

        {/* Planos */}
        <div className="flex items-center justify-center gap-4">
          <div className="w-full max-w-md">
            <SubscriptionPlan
              userEmail={session.user.email}
              planId="essential"
              planName="Essential"
              features={PlanFeatures.essential}
              price={39}
              description="Perfeito para negócios em crescimento e profissionais autônomos"
              active={currentPlan === "essential"}
              trialDays={PLAN_CATALOG.find((p) => p.id === "essential")?.trialDays}
              trialEligible={trialEligible}
              isTrialActive={currentPlan === "essential" && !!userRow?.planExpiresAt}
              planExpiresAt={userRow?.planExpiresAt ?? null}
            />
          </div>

          <div className="w-full max-w-md">
            <SubscriptionPlan
              userEmail={session.user.email}
              planId="premium"
              planName="Premium"
              features={PlanFeatures.premium}
              price={59}
              description="Ideal para empressas e profissionais com um número maior de agendamentos"
              active={currentPlan === "premium"}
              trialDays={PLAN_CATALOG.find((p) => p.id === "premium")?.trialDays}
              trialEligible={trialEligible}
              isTrialActive={currentPlan === "premium" && !!userRow?.planExpiresAt}
              planExpiresAt={userRow?.planExpiresAt ?? null}
            />
          </div>

          <div className="w-full max-w-md">
            <SubscriptionPlan
              userEmail={session.user.email}
              planId="gold"
              planName="Gold"
              features={PlanFeatures.gold}
              price={99}
              description="Para empresas buscam rescursos avançados e desejam uma solução e personalizada"
              active={currentPlan === "gold"}
            />
          </div>
        </div>

        {/* Rodapé */}
        <footer className="mt-12 w-full border-t border-slate-200 py-8 text-center text-sm text-slate-500">
          <p>
            © {new Date().getFullYear()} M.Agendy. Todos os direitos
            reservados.
          </p>
          <p className="mt-1">
            Desenvolvido por{" "}
            <span className="font-medium">Matheus Queiroz</span>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default NewSubscriptionPage;
