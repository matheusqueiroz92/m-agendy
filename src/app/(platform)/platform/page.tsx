import { Building2, CalendarDays, ShieldOff, Users } from "lucide-react";
import { redirect } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
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

const StatCard = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <Card>
    <CardContent className="flex items-center gap-4 p-6">
      <div className="rounded-lg bg-muted p-3">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-muted-foreground text-sm">{label}</p>
      </div>
    </CardContent>
  </Card>
);

const PlatformDashboardPage = async () => {
  const actor = await getAuthenticatedActor();
  if (!actor) redirect("/auth");

  const clinics = await makeListClinicsAdmin().execute({ actor });

  const totalClinics = clinics.length;
  const blocked = clinics.filter((c) => c.status === "blocked").length;
  const patients = clinics.reduce((s, c) => s + c.patientsCount, 0);
  const appointments = clinics.reduce((s, c) => s + c.appointmentsCount, 0);

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Visão geral da plataforma</PageTitle>
          <PageDescription>
            Indicadores gerais das clínicas e consultórios do sistema.
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Clínicas" value={totalClinics} icon={Building2} />
          <StatCard label="Bloqueadas" value={blocked} icon={ShieldOff} />
          <StatCard label="Pacientes (total)" value={patients} icon={Users} />
          <StatCard
            label="Consultas (total)"
            value={appointments}
            icon={CalendarDays}
          />
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default PlatformDashboardPage;
