import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
} from "@/components/ui/page-container";
import { db } from "@/db";
import {
  appointmentsTable,
  clinicalAttendancesTable,
  diagnosesTable,
  doctorsTable,
  followUpsTable,
  patientsTable,
  prescriptionsTable,
} from "@/db/schema";
import { getAuthenticatedActor } from "@/core/modules/iam/infra/session-actor-provider";
import { makeLogMedicalRecordAccess } from "@/core/modules/medical-records/infra/factories/make-log-medical-record-access";
import { ForbiddenError } from "@/core/shared/domain/errors";
import { auth } from "@/lib/auth";

import { SetHeaderBreadcrumbs } from "../../_components/header-breadcrumb-context";
import { MedicalRecordHeader } from "./_components/medical-record-header";
import { MedicalRecordTabs } from "./_components/medical-record-tabs";

interface MedicalRecordPageProps {
  params: Promise<{ patientId: string }>;
}

const MedicalRecordPage = async ({ params }: MedicalRecordPageProps) => {
  const { patientId } = await params;

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

  // RBAC de leitura (staff é barrado) + auditoria de acesso (LGPD).
  const actor = await getAuthenticatedActor();
  const access = await makeLogMedicalRecordAccess()
    .execute({ actor, clinicId, patientId })
    .then(() => "ok" as const)
    .catch((error) =>
      error instanceof ForbiddenError ? "forbidden" : "notfound",
    );
  if (access === "forbidden") {
    redirect("/dashboard");
  }
  if (access === "notfound") {
    notFound();
  }

  const patient = await db.query.patientsTable.findFirst({
    where: and(
      eq(patientsTable.id, patientId),
      eq(patientsTable.clinicId, clinicId),
    ),
    with: {
      medicalRecord: true,
    },
  });

  if (!patient) {
    notFound();
  }

  const [appointments, attendances, diagnoses, prescriptions, followUps, doctors] =
    await Promise.all([
      db.query.appointmentsTable.findMany({
        where: eq(appointmentsTable.patientId, patientId),
        orderBy: [desc(appointmentsTable.date)],
        with: { doctor: true },
      }),
      db.query.clinicalAttendancesTable.findMany({
        where: eq(clinicalAttendancesTable.patientId, patientId),
        orderBy: [desc(clinicalAttendancesTable.date)],
        with: { doctor: true },
      }),
      db.query.diagnosesTable.findMany({
        where: eq(diagnosesTable.patientId, patientId),
        orderBy: [desc(diagnosesTable.date)],
      }),
      db.query.prescriptionsTable.findMany({
        where: eq(prescriptionsTable.patientId, patientId),
        orderBy: [desc(prescriptionsTable.date)],
        with: { doctor: true },
      }),
      db.query.followUpsTable.findMany({
        where: eq(followUpsTable.patientId, patientId),
        orderBy: [desc(followUpsTable.createdAt)],
      }),
      db.query.doctorsTable.findMany({
        where: eq(doctorsTable.clinicId, clinicId),
        orderBy: (doctors, { asc }) => [asc(doctors.name)],
      }),
    ]);

  return (
    <PageContainer>
      <SetHeaderBreadcrumbs
        items={[
          { label: "Início", href: "/dashboard" },
          { label: "Prontuários", href: "/medical-records" },
          { label: patient.name },
        ]}
      />

      <PageHeader>
        <PageHeaderContent>
          <MedicalRecordHeader
            patient={patient}
            appointmentsCount={appointments.length}
            attendancesCount={attendances.length}
            activeDiagnosesCount={
              diagnoses.filter((diagnosis) => diagnosis.status !== "resolved")
                .length
            }
          />
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        <MedicalRecordTabs
          patient={patient}
          medicalRecord={patient.medicalRecord ?? null}
          appointments={appointments}
          attendances={attendances}
          diagnoses={diagnoses}
          prescriptions={prescriptions}
          followUps={followUps}
          doctors={doctors}
        />
      </PageContent>
    </PageContainer>
  );
};

export default MedicalRecordPage;
