"use client";

import { CalendarX } from "lucide-react";

import { DataNotFound } from "@/components/ui/data-not-found";
import { DataTable } from "@/components/ui/data-table";
import { useProfessionalLabels } from "@/hooks/use-professional-labels";
import { appointmentsTable, doctorsTable } from "@/db/schema";

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
}

export const AppointmentsTable = ({
  appointments,
  doctors,
}: AppointmentsTableProps) => {
  const { singular: professionalLabel } = useProfessionalLabels();
  const appointmentsTableColumns = createAppointmentsTableColumns(
    doctors,
    professionalLabel,
  );

  if (appointments.length === 0) {
    return (
      <DataNotFound
        title="Nenhuma consulta neste período"
        icon={<CalendarX className="text-muted-foreground h-12 w-12" />}
        description="Crie a primeira consulta para começar."
      />
    );
  }

  return <DataTable columns={appointmentsTableColumns} data={appointments} />;
};
