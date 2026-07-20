import { eq } from "drizzle-orm";
import { SearchX } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { DataNotFound } from "@/components/ui/data-not-found";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { getClinicTypeConfig } from "@/core/modules/clinics/domain/clinic-type";
import { db } from "@/db";
import { doctorsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { AddDoctorButton } from "./_components/add-doctor-button";
import { DoctorCard } from "./_components/doctor-card";

const DoctorsPage = async () => {
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

  const config = getClinicTypeConfig(session.user.clinic.type);
  const plural = config.professionalPlural;
  const singular = config.professionalSingular.toLowerCase();

  const doctors = await db.query.doctorsTable.findMany({
    where: eq(doctorsTable.clinicId, session.user.clinic.id),
    with: { availabilityWindows: true },
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>{plural}</PageTitle>
          <PageDescription>
            Gerencie os profissionais da sua clínica
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddDoctorButton />
        </PageActions>
      </PageHeader>
      <PageContent>
        {doctors.length > 0 ? (
          <div className="grid grid-cols-4 gap-6">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        ) : (
          <DataNotFound
            title={`Nenhum ${singular} cadastrado!`}
            description={`Ainda não há ${plural.toLowerCase()} cadastrados. Adicione um ${singular} ao sistema.`}
            icon={<SearchX className="text-muted-foreground h-8 w-8" />}
          />
        )}
      </PageContent>
    </PageContainer>
  );
};

export default DoctorsPage;
