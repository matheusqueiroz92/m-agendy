import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { getPlan } from "@/core/modules/billing/domain/plans";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { PlanFeatures } from "../_contants/plan-features";
import { SubscriptionPlan } from "./_components/subscription-plan";

const SubscriptionPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }

  if (!session?.user.clinic) {
    redirect("/clinic-form");
  }

  // Sem plano ativo: gerido pelo layout (redireciona para /new-subscription),
  // mas o guard vale aqui também caso esta página seja acessada isolada.
  const currentPlan = session.user.plan ?? null;
  if (!currentPlan) {
    redirect("/new-subscription");
  }

  const planDef = getPlan(currentPlan);
  const userRow = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, session.user.id),
  });
  const isTrialActive = !!userRow?.planExpiresAt;

  return (
    <PageContainer>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Outros</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem className="font-semibold text-[var(--primary)]">
            Assinatura
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Assinatura</PageTitle>
          <PageDescription>Gerencie seu plano de assinatura</PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <div className="flex justify-start">
          <SubscriptionPlan
            active
            userEmail={session.user.email}
            planId={currentPlan}
            planName={planDef?.label ?? currentPlan}
            price={planDef?.monthlyPriceInBRL}
            description={planDef?.description}
            features={
              PlanFeatures[currentPlan as keyof typeof PlanFeatures] ?? []
            }
            isTrialActive={isTrialActive}
            planExpiresAt={userRow?.planExpiresAt ?? null}
          />
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default SubscriptionPage;
