import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { getAuthenticatedActor } from "@/core/modules/iam/infra/session-actor-provider";
import { db } from "@/db";
import { clinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { SettingsForm } from "./_components/settings-form";

const SettingsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth");
  }

  if (!session?.user?.clinic) {
    redirect("/clinic-form");
  }

  if (!session.user.plan) {
    redirect("/new-subscription");
  }

  const clinicId = session.user.clinic.id;

  // Apenas gestores (owner/manager) ou admin de plataforma configuram a
  // integração do WhatsApp (número da clínica).
  const actor = await getAuthenticatedActor();
  const canManageClinic = actor?.canManageClinic(clinicId) ?? false;

  const clinic = await db.query.clinicsTable.findFirst({
    where: eq(clinicsTable.id, clinicId),
    columns: { whatsappPhoneNumberId: true },
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Configurações</PageTitle>
          <PageDescription>
            Gerencie as configurações da sua conta e da clínica
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <SettingsForm
          user={session.user}
          canManageClinic={canManageClinic}
          clinicWhatsappPhoneNumberId={clinic?.whatsappPhoneNumberId ?? ""}
        />
      </PageContent>
    </PageContainer>
  );
};

export default SettingsPage;
