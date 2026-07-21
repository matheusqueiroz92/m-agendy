"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

import { Badge } from "@/components/ui/badge";
import { appointmentsTable, doctorsTable } from "@/db/schema";

import { AppointmentTableActions } from "./table-actions";

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

export const createAppointmentsTableColumns = (
  doctors: (typeof doctorsTable.$inferSelect)[],
  professionalLabel: string,
): ColumnDef<AppointmentWithRelations>[] => [
  {
    id: "patient",
    accessorKey: "patient.name",
    header: "Paciente",
    cell: (params) => {
      const appointment = params.row.original;
      return (
        <div>
          <p className="font-medium">{appointment.patient.name}</p>
          <p className="text-muted-foreground text-sm">
            {appointment.patient.email}
          </p>
        </div>
      );
    },
  },
  {
    id: "doctor",
    accessorKey: "doctor.name",
    header: professionalLabel,
    cell: (params) => {
      const appointment = params.row.original;
      return <p>{appointment.doctor.name}</p>;
    },
  },
  {
    id: "speciality",
    accessorKey: "doctor.speciality",
    header: "Especialidade",
    cell: (params) => {
      const appointment = params.row.original;
      return <Badge variant="outline">{appointment.doctor.speciality}</Badge>;
    },
  },
  {
    id: "date",
    accessorKey: "date",
    header: "Data e Horário",
    cell: (params) => {
      const appointment = params.row.original;
      return (
        <div>
          <p className="font-medium">
            {format(new Date(appointment.date), "dd/MM/yyyy", { locale: ptBR })}
          </p>
          <p className="text-muted-foreground text-sm">
            {format(new Date(appointment.date), "HH:mm", { locale: ptBR })}
          </p>
        </div>
      );
    },
  },
  {
    id: "price",
    accessorKey: "appointmentPriceInCents",
    header: "Valor",
    cell: (params) => {
      const appointment = params.row.original;
      const price = appointment.appointmentPriceInCents / 100;
      return (
        <Badge variant="outline">
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(price)}
        </Badge>
      );
    },
  },
  {
    id: "type",
    accessorKey: "type",
    header: "Tipo",
    cell: (params) => {
      const appointment = params.row.original;
      const label: Record<typeof appointment.type, string> = {
        consultation: "Consulta",
        return_visit: "Retorno",
      };
      return <Badge variant="outline">{label[appointment.type]}</Badge>;
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: (params) => {
      const appointment = params.row.original;
      const status = appointment.status;
      const label: Record<typeof status, string> = {
        pending: "Pendente",
        confirmed: "Confirmado",
        cancelled: "Cancelado",
        no_show: "Falta",
      };
      const variant: Record<
        typeof status,
        "outline" | "default" | "destructive" | "secondary"
      > = {
        pending: "outline",
        confirmed: "default",
        cancelled: "secondary",
        no_show: "destructive",
      };
      return <Badge variant={variant[status]}>{label[status]}</Badge>;
    },
  },
  {
    id: "actions",
    cell: (params) => {
      const appointment = params.row.original;
      return (
        <AppointmentTableActions
          appointment={appointment}
          doctors={doctors}
        />
      );
    },
  },
];
