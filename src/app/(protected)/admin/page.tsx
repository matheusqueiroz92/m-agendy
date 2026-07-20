import dayjs from "dayjs";
import { Building2 } from "lucide-react";
import { redirect } from "next/navigation";

import { DataNotFound } from "@/components/ui/data-not-found";
import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { makeListClinics } from "@/core/modules/iam/infra/factories/make-list-clinics";
import { getAuthenticatedActor } from "@/core/modules/iam/infra/session-actor-provider";

const AdminPage = async () => {
  const actor = await getAuthenticatedActor();

  if (!actor) {
    redirect("/auth");
  }

  // Guarda de rota: somente admin de plataforma. O caso de uso reforça isso.
  if (!actor.isPlatformAdmin()) {
    redirect("/dashboard");
  }

  const clinics = await makeListClinics().execute({ actor });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Administração da plataforma</PageTitle>
          <PageDescription>
            Todas as clínicas do sistema e suas estatísticas.
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        {clinics.length === 0 ? (
          <DataNotFound
            title="Nenhuma clínica cadastrada"
            description="Ainda não há clínicas no sistema."
            icon={<Building2 className="text-muted-foreground h-8 w-8" />}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Clínica</TableHead>
                <TableHead>Criada em</TableHead>
                <TableHead>Membros</TableHead>
                <TableHead>Médicos</TableHead>
                <TableHead>Pacientes</TableHead>
                <TableHead>Consultas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clinics.map((clinic) => (
                <TableRow key={clinic.id}>
                  <TableCell className="font-medium">{clinic.name}</TableCell>
                  <TableCell>
                    {dayjs(clinic.createdAt).format("DD/MM/YYYY")}
                  </TableCell>
                  <TableCell>{clinic.membersCount}</TableCell>
                  <TableCell>{clinic.doctorsCount}</TableCell>
                  <TableCell>{clinic.patientsCount}</TableCell>
                  <TableCell>{clinic.appointmentsCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </PageContent>
    </PageContainer>
  );
};

export default AdminPage;
