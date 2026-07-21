import { CalendarCheck, CalendarClock } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { makeGetPatientPortalAgenda } from "@/core/modules/patient-portal/infra/factories/make-get-patient-portal-agenda";
import { PortalAppointment } from "@/core/modules/patient-portal/application/ports/patient-appointments-reader";
import { formatInClinicTimezone } from "@/core/shared/domain/combine-date-and-time";
import { formatCurrencyInCents } from "@/helpers/currency";
import { auth } from "@/lib/auth";

import { PortalSignOut } from "./_components/portal-sign-out";

const AppointmentRow = ({ appointment }: { appointment: PortalAppointment }) => (
  <div className="flex items-center justify-between gap-2 border-b py-3 last:border-b-0">
    <div className="min-w-0">
      <p className="text-sm font-medium">
        {formatInClinicTimezone(appointment.scheduledAt, "DD/MM/YYYY [às] HH:mm")}
      </p>
      <p className="text-muted-foreground truncate text-sm">
        {appointment.doctorName} · {appointment.clinicName}
      </p>
    </div>
    <Badge variant="outline">
      {formatCurrencyInCents(appointment.priceInCents)}
    </Badge>
  </div>
);

const PatientPortalPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth");
  }

  const agenda = await makeGetPatientPortalAgenda().execute({
    userId: session.user.id,
    email: session.user.email,
  });

  return (
    <div className="bg-muted/30 min-h-screen p-4 md:p-8">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Olá{agenda.patientName ? `, ${agenda.patientName}` : ""}!
            </h1>
            <p className="text-muted-foreground text-sm">
              Acompanhe suas consultas
            </p>
          </div>
          <PortalSignOut />
        </div>

        {!agenda.linked ? (
          <Card>
            <CardContent className="text-muted-foreground py-10 text-center text-sm">
              Não encontramos um cadastro de paciente vinculado a este e-mail.
              Verifique se você usou o mesmo e-mail informado na clínica.
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CalendarClock className="h-4 w-4" />
                  Próximas consultas
                </CardTitle>
                <CardDescription>
                  Suas consultas agendadas a partir de hoje.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {agenda.upcoming.length === 0 ? (
                  <p className="text-muted-foreground py-4 text-center text-sm">
                    Nenhuma consulta agendada.
                  </p>
                ) : (
                  agenda.upcoming.map((appointment) => (
                    <AppointmentRow
                      key={appointment.id}
                      appointment={appointment}
                    />
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CalendarCheck className="h-4 w-4" />
                  Histórico
                </CardTitle>
                <CardDescription>Suas consultas anteriores.</CardDescription>
              </CardHeader>
              <CardContent>
                {agenda.past.length === 0 ? (
                  <p className="text-muted-foreground py-4 text-center text-sm">
                    Nenhuma consulta anterior.
                  </p>
                ) : (
                  agenda.past.map((appointment) => (
                    <AppointmentRow
                      key={appointment.id}
                      appointment={appointment}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default PatientPortalPage;
