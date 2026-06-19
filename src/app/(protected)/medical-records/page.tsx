import { eq } from "drizzle-orm";
import { SearchX } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DataNotFound } from "@/components/ui/data-not-found";
import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { getAuthenticatedActor } from "@/core/modules/iam/infra/session-actor-provider";
import { auth } from "@/lib/auth";

import { PatientRecordsList } from "./_components/patient-records-list";

const MedicalRecordsPage = async () => {
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

  // Dados clínicos: recepção (staff) não acessa prontuários.
  const actor = await getAuthenticatedActor();
  if (!actor?.canAccessClinicalData(session.user.clinic.id)) {
    redirect("/dashboard");
  }

  const patients = await db.query.patientsTable.findMany({
    where: eq(patientsTable.clinicId, session.user.clinic.id),
    orderBy: (patients, { asc }) => [asc(patients.name)],
  });

  return (
    <PageContainer>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>Menu Principal</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem className="font-semibold text-[var(--primary)]">
            Prontuários
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Prontuários eletrônicos</PageTitle>
          <PageDescription>
            Acesse o histórico clínico completo dos pacientes da sua clínica.
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        {patients.length > 0 ? (
          <PatientRecordsList patients={patients} />
        ) : (
          <DataNotFound
            title="Nenhum paciente cadastrado!"
            description="Cadastre pacientes para começar a registrar prontuários."
            icon={<SearchX className="text-muted-foreground h-8 w-8" />}
          />
        )}
      </PageContent>
    </PageContainer>
  );
};

export default MedicalRecordsPage;
