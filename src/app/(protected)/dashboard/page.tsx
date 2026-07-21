import dayjs from "dayjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { PageSection } from "@/components/ui/page-section";
import { getDashboard } from "@/data/get-dashboard";
import { getDataTableAppointments } from "@/data/get-data-table-appointments";
import { auth } from "@/lib/auth";

import { AppointmentsTable } from "../appointments/_components/appointments-table";
import { AppointmentsChart } from "./_components/appointments-chart";
import { DatePicker } from "./_components/date-picker";
import { StatsCards } from "./_components/stats-cards";
import { getClinicTypeConfig } from "@/core/modules/clinics/domain/clinic-type";
import { planHasFeature } from "@/core/modules/billing/domain/entitlements";
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

  const professionalConfig = getClinicTypeConfig(
    session.user.clinic.type,
  );

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

  const { doctors, appointments } = await getDataTableAppointments({
    session: {
      user: {
        clinic: {
          id: session.user.clinic.id,
        },
      },
    },
  });

  const showDetailedMetrics = planHasFeature(session.user.plan, "detailedMetrics");

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Dashboard</PageTitle>
          <PageDescription>
            Resumo do período selecionado.
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
          professionalsLabel={professionalConfig.professionalPlural}
        />

        {showDetailedMetrics ? (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
            <AppointmentsChart dailyAppointmentsData={dailyAppointmentsData} />
            <TopDoctors
              topDoctors={topDoctors}
              professionalsLabel={professionalConfig.professionalPlural}
              professionalSingular={professionalConfig.professionalSingular}
            />
          </div>
        ) : (
          <PageSection title="Métricas detalhadas">
            <p className="text-muted-foreground text-sm">
              Gráficos e rankings de desempenho estão disponíveis nos planos
              Premium e Gold. Faça upgrade na página de Assinatura para
              desbloquear as métricas detalhadas.
            </p>
          </PageSection>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
          <PageSection title="Consultas recentes">
            <AppointmentsTable
              appointments={appointments}
              doctors={doctors}
            />
          </PageSection>
          {showDetailedMetrics && (
            <TopSpecialities topSpecialities={topSpecialities} />
          )}
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default DashboardPage;
