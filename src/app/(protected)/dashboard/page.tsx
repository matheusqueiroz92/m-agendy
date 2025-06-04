import dayjs from "dayjs";
import { Calendar } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { Separator } from "@/components/ui/separator";
import { getDashboard } from "@/data/get-dashboard";
import { getDataTableAppointments } from "@/data/get-data-table-appointments";
import { auth } from "@/lib/auth";

import { AppointmentsTable } from "../appointments/_components/appointments-table";
import { AppointmentsChart } from "./_components/appointments-chart";
import { DatePicker } from "./_components/date-picker";
import { StatsCards } from "./_components/stats-cards";
import { TopDoctors } from "./_components/top-doctors";
import { TopSpecialities } from "./_components/top-specialities";

interface DashboardPageProps {
  searchParams: Promise<{
    from: string;
    to: string;
  }>;
}

const DashboardPage = async ({ searchParams }: DashboardPageProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth");
  }

  if (!session.user.clinic) {
    redirect("/clinic-form");
  }

  if (!session.user.plan) {
    redirect("/new-subscription");
  }

  const { from, to } = await searchParams;
  if (!from || !to) {
    redirect(
      `/dashboard?from=${dayjs().format("YYYY-MM-DD")}&to=${dayjs().add(1, "month").format("YYYY-MM-DD")}`,
    );
  }
  const {
    totalRevenue,
    totalAppointments,
    totalPatients,
    totalDoctors,
    topDoctors,
    topSpecialities,
    todayAppointments,
    dailyAppointmentsData,
  } = await getDashboard({
    from,
    to,
    session: {
      user: {
        clinic: {
          id: session.user.clinic.id,
        },
      },
    },
  });

  const { doctors, patients } = await getDataTableAppointments({
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
            Dashboard
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Dashboard</PageTitle>
          <PageDescription>
            Tenha uma visão geral da sua clínica.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <DatePicker />
        </PageActions>
      </PageHeader>
      <PageContent>
        <StatsCards
          totalRevenue={totalRevenue.total ? Number(totalRevenue.total) : null}
          totalAppointments={totalAppointments.total}
          totalPatients={totalPatients.total}
          totalDoctors={totalDoctors.total}
        />

        <div className="grid grid-cols-[2.25fr_1fr] gap-4">
          <AppointmentsChart dailyAppointmentsData={dailyAppointmentsData} />
          <TopDoctors topDoctors={topDoctors} />
        </div>

        <div className="grid grid-cols-[2.25fr_1fr] gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Calendar className="text-[var(--primary)]" />
              <CardTitle>Agendamentos e Faturamento</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent>
              <AppointmentsTable
                appointments={todayAppointments}
                doctors={doctors}
                patients={patients}
              />
            </CardContent>
          </Card>
          <TopSpecialities topSpecialities={topSpecialities} />
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default DashboardPage;
