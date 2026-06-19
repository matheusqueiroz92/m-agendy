import { redirect } from "next/navigation";

import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { makeListClinicsAdmin } from "@/core/modules/clinics/infra/factories/make-admin-clinic-use-cases";
import { getAuthenticatedActor } from "@/core/modules/iam/infra/session-actor-provider";

import { ClinicsManager } from "./_components/clinics-manager";

const PlatformClinicsPage = async () => {
  const actor = await getAuthenticatedActor();
  if (!actor) redirect("/auth");

  const clinics = await makeListClinicsAdmin().execute({ actor });

  // Serializa datas para o client component.
  const rows = clinics.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    planOverrideExpiresAt: c.planOverrideExpiresAt
      ? c.planOverrideExpiresAt.toISOString()
      : null,
  }));

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Clínicas e consultórios</PageTitle>
          <PageDescription>
            Cadastre, edite, bloqueie/libere o acesso e ajuste o plano das
            clínicas contratantes.
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <ClinicsManager clinics={rows} />
      </PageContent>
    </PageContainer>
  );
};

export default PlatformClinicsPage;
