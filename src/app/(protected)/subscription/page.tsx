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
          <PageDescription>Gerencie o plano da sua assinatura</PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <div className="justify-cente flex h-full flex-1 items-center">
          <SubscriptionPlan
            active={session.user.plan === "premium"}
            userEmail={session.user.email}
            planName="Premium"
            price={59}
            features={PlanFeatures.premium}
          />
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default SubscriptionPage;
