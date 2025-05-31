"use client";

import { ColumnDef } from "@tanstack/react-table";

import FemaleIcon from "@/components/ui/female-icon";
import MaleIcon from "@/components/ui/male-icon";
import { patientsTable } from "@/db/schema";

import PatientsTableActions from "./table-actions";

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
        <span className="flex items-center gap-2">
          <MaleIcon /> Masculino
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <FemaleIcon /> Feminino
        </span>
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
