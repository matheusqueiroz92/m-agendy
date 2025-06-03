"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import FemaleIcon from "@/components/ui/female-icon";
import MaleIcon from "@/components/ui/male-icon";
import { patientsTable } from "@/db/schema";

import { PatientsTableActions } from "./table-actions";

type Patient = typeof patientsTable.$inferSelect;

export const patientsTableColumns: ColumnDef<Patient>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Nome",
  },
  {
    id: "email",
    accessorKey: "email",
    header: "Email",
  },
  {
    id: "phoneNumber",
    accessorKey: "phoneNumber",
    header: "Telefone",
    cell: (params) => {
      const phoneNumber = params.row.original.phoneNumber;
      const formattedPhone = `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7)}`;
      return formattedPhone;
    },
  },
  {
    id: "sex",
    accessorKey: "sex",
    header: "Sexo",
    cell: (params) => {
      const patient = params.row.original;
      return patient.sex === "male" ? (
        <Badge variant="outline">
          <MaleIcon /> Masculino
        </Badge>
      ) : (
        <Badge variant="outline">
          <FemaleIcon /> Feminino
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: (params) => {
      const patient = params.row.original;
      return <PatientsTableActions patient={patient} />;
    },
  },
];
