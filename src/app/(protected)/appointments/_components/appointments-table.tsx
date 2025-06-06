"use client";

import { CalendarX } from "lucide-react";

import { DataNotFound } from "@/components/ui/data-not-found";
import { DataTable } from "@/components/ui/data-table";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";

import { createAppointmentsTableColumns } from "./table-columns";

type AppointmentWithRelations = typeof appointmentsTable.$inferSelect & {
  patient: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
  doctor: {
    id: string;
    name: string;
    speciality: string;
  };
};

interface AppointmentsTableProps {
  appointments: AppointmentWithRelations[];
  doctors: (typeof doctorsTable.$inferSelect)[];
  patients: (typeof patientsTable.$inferSelect)[];
}

export const AppointmentsTable = ({
  appointments,
  doctors,
  patients,
}: AppointmentsTableProps) => {
  const appointmentsTableColumns = createAppointmentsTableColumns(
    doctors,
    patients,
  );

  if (appointments.length === 0) {
    return (
      <DataNotFound
        title="Nenhum agendamento cadastrado!"
        icon={<CalendarX className="text-muted-foreground h-12 w-12" />}
        description="Ainda não há agendamentos cadastrados. Adicione um agendamento ao sistema."
      />
    );
  }

  return <DataTable columns={appointmentsTableColumns} data={appointments} />;
};
