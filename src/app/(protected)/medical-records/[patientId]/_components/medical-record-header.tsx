import { CalendarDays, FileText, Stethoscope } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { Patient } from "./types";

interface MedicalRecordHeaderProps {
  patient: Patient;
  appointmentsCount: number;
  attendancesCount: number;
  activeDiagnosesCount: number;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

export const MedicalRecordHeader = ({
  patient,
  appointmentsCount,
  attendancesCount,
  activeDiagnosesCount,
}: MedicalRecordHeaderProps) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarFallback>{getInitials(patient.name)}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {patient.name}
          </h1>
          <p className="text-muted-foreground text-sm">
            {patient.email} · {patient.sex === "male" ? "Masculino" : "Feminino"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="gap-1">
          <CalendarDays className="h-3 w-3" />
          {appointmentsCount} consulta(s)
        </Badge>
        <Badge variant="outline" className="gap-1">
          <Stethoscope className="h-3 w-3" />
          {attendancesCount} atendimento(s)
        </Badge>
        <Badge variant="outline" className="gap-1">
          <FileText className="h-3 w-3" />
          {activeDiagnosesCount} diagnóstico(s) ativo(s)
        </Badge>
      </div>
    </div>
  );
};
