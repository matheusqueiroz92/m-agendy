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

import { SubscriptionPlan } from "./_components/subscription-plan";

const SubscriptionPage = () => {
  const active = false;
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
          <PageDescription>Gerencie a sua assinatura</PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <SubscriptionPlan active={active} />
      </PageContent>
    </PageContainer>
  );
};

export default SubscriptionPage;
