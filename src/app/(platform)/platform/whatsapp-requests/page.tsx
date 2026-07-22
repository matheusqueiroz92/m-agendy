import { redirect } from "next/navigation";

import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { makeListWhatsAppIntegrationRequests } from "@/core/modules/clinics/infra/factories/make-whatsapp-integration-use-cases";
import { getAuthenticatedActor } from "@/core/modules/iam/infra/session-actor-provider";

import { WhatsAppRequestsManager } from "./_components/whatsapp-requests-manager";

const PlatformWhatsAppRequestsPage = async () => {
  const actor = await getAuthenticatedActor();
  if (!actor) redirect("/auth");

  const requests = await makeListWhatsAppIntegrationRequests().execute({
    actor,
  });

  // Serializa datas para o client component.
  const rows = requests.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    completedAt: r.completedAt ? r.completedAt.toISOString() : null,
  }));

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Integração de WhatsApp</PageTitle>
          <PageDescription>
            Solicitações de clínicas Premium/Gold para usar o próprio número
            de WhatsApp. Configure no Meta Business Manager e conclua aqui com
            o phone_number_id obtido.
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <WhatsAppRequestsManager requests={rows} />
      </PageContent>
    </PageContainer>
  );
};

export default PlatformWhatsAppRequestsPage;
