import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { getClinicTypeConfig } from "@/core/modules/clinics/domain/clinic-type";
import { db } from "@/db";
import { clinicsTable, doctorsTable } from "@/db/schema";

import { BookingForm } from "./_components/booking-form";

interface PublicBookingPageProps {
  params: Promise<{ clinicId: string }>;
}

const PublicBookingPage = async ({ params }: PublicBookingPageProps) => {
  const { clinicId } = await params;

  const clinic = await db.query.clinicsTable.findFirst({
    where: eq(clinicsTable.id, clinicId),
  });

  if (!clinic) {
    notFound();
  }

  const doctors = await db.query.doctorsTable.findMany({
    where: eq(doctorsTable.clinicId, clinicId),
    orderBy: (doctors, { asc }) => [asc(doctors.name)],
  });

  const config = getClinicTypeConfig(clinic.type);

  const professionals = doctors.map((doctor) => ({
    id: doctor.id,
    name: doctor.name,
    speciality: doctor.speciality,
    appointmentPriceInCents: doctor.appointmentPriceInCents,
    availableFromWeekDay: doctor.availableFromWeekDay,
    availableToWeekDay: doctor.availableToWeekDay,
    availableFromTime: doctor.availableFromTime,
    availableToTime: doctor.availableToTime,
  }));

  return (
    <div className="bg-muted/30 flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {clinic.name}
          </h1>
          <p className="text-muted-foreground text-sm">
            Agende sua consulta online
          </p>
        </div>

        <BookingForm
          clinicId={clinic.id}
          professionals={professionals}
          professionalLabel={config.professionalSingular}
        />
      </div>
    </div>
  );
};

export default PublicBookingPage;
