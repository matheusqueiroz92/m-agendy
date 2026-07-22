import { redirect } from "next/navigation";

import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { DrizzleMarketingAudience } from "@/core/modules/marketing/infra/persistence/drizzle-marketing-audience";
import { getAuthenticatedActor } from "@/core/modules/iam/infra/session-actor-provider";

import { MarketingEmailComposer } from "./_components/marketing-email-composer";

const PlatformMarketingEmailsPage = async () => {
  const actor = await getAuthenticatedActor();
  if (!actor) redirect("/auth");

  const recipients = await new DrizzleMarketingAudience().listOptedInRecipients();

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>E-mails de Marketing</PageTitle>
          <PageDescription>
            Envie novidades, promoções e informações para as clínicas que
            optaram por receber ("Emails de Marketing" em Configurações).
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <MarketingEmailComposer recipientCount={recipients.length} />
      </PageContent>
    </PageContainer>
  );
};

export default PlatformMarketingEmailsPage;
