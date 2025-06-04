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
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { getDataTableAppointments } from "@/data/get-data-table-appointments";
import { auth } from "@/lib/auth";

import { AddAppointmentButton } from "./_components/add-appointment-button";
import { AppointmentsTable } from "./_components/appointments-table";

const AppointmentsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth");
  }

  if (!session?.user?.clinic) {
    redirect("/clinic-form");
  }

  const { doctors, patients, appointments } = await getDataTableAppointments({
    session: {
      user: {
        clinic: {
          id: session.user.clinic.id,
        },
      },
    },
  });

  return (
    <PageContainer>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Menu Principal</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem className="font-semibold text-[var(--primary)]">
            Agendamentos
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Agendamentos</PageTitle>
          <PageDescription>
            Gerencie os agendamentos da sua clínica
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddAppointmentButton doctors={doctors} patients={patients} />
        </PageActions>
      </PageHeader>
      <PageContent>
        <AppointmentsTable
          appointments={appointments}
          doctors={doctors}
          patients={patients}
        />
      </PageContent>
    </PageContainer>
  );
};

export default AppointmentsPage;
