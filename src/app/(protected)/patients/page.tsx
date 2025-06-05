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
import { DataTable } from "@/components/ui/data-table";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { AddPatientButton } from "./_components/add-patient-button";
import { patientsTableColumns } from "./_components/table-columns";

const PatientsPage = async () => {
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

  const patients = await db.query.patientsTable.findMany({
    where: eq(patientsTable.clinicId, session.user.clinic.id),
  });

  return (
    <PageContainer>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>Menu Principal</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem className="font-semibold text-[var(--primary)]">
            Pacientes
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Pacientes</PageTitle>
          <PageDescription>
            Gerencie os pacientes da sua clínica
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddPatientButton />
        </PageActions>
      </PageHeader>
      <PageContent>
        {patients.length > 0 ? (
          <DataTable columns={patientsTableColumns} data={patients} />
        ) : (
          <DataNotFound
            title="Nenhum paciente cadastrado!"
            description="Ainda não há pacientes cadastrados. Adicione um paciente ao sistema."
            icon={<SearchX className="text-muted-foreground h-8 w-8" />}
          />
        )}
      </PageContent>
    </PageContainer>
  );
};

export default PatientsPage;
