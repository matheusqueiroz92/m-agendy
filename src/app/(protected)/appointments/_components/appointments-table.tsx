"use client";

import { DataTable } from "@/components/data-table";
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

const AppointmentsTable = ({
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
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-muted rounded-full p-6">
          <svg
            className="text-muted-foreground h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0V17a2 2 0 002 2h4a2 2 0 002-2V7m-6 0H5a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1"
            />
          </svg>
        </div>
        <h3 className="text-foreground mt-4 text-lg font-medium">
          Nenhum agendamento cadastrado
        </h3>
        <p className="text-muted-foreground mt-2 text-sm">
          Comece adicionando seu primeiro agendamento clicando no botão acima.
        </p>
      </div>
    );
  }

  return <DataTable columns={appointmentsTableColumns} data={appointments} />;
};

export default AppointmentsTable;
