"use client";

import { AlertTriangle, Pill, Stethoscope } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { diagnosisStatusLabels, followUpStatusLabels, formatDate } from "./labels";
import {
  AppointmentWithDoctor,
  Diagnosis,
  FollowUp,
  MedicalRecord,
  PrescriptionWithDoctor,
} from "./types";

interface OverviewTabProps {
  medicalRecord: MedicalRecord | null;
  appointments: AppointmentWithDoctor[];
  diagnoses: Diagnosis[];
  followUps: FollowUp[];
  prescriptions: PrescriptionWithDoctor[];
}

const EmptyText = ({ children }: { children: React.ReactNode }) => (
  <p className="text-muted-foreground text-sm">{children}</p>
);

export const OverviewTab = ({
  medicalRecord,
  diagnoses,
  followUps,
  prescriptions,
}: OverviewTabProps) => {
  const latestDiagnoses = diagnoses.slice(0, 5);
  const latestPrescriptions = prescriptions.slice(0, 5);
  const openFollowUps = followUps.filter(
    (followUp) =>
      followUp.status === "pending" || followUp.status === "in_progress",
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Alertas e informações críticas
          </CardTitle>
          <CardDescription>
            Alergias e medicamentos de uso contínuo do paciente.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs font-medium uppercase">
              Alergias
            </p>
            {medicalRecord?.allergies ? (
              <p className="text-sm whitespace-pre-wrap">
                {medicalRecord.allergies}
              </p>
            ) : (
              <EmptyText>Nenhuma alergia registrada.</EmptyText>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs font-medium uppercase">
              Medicamentos em uso
            </p>
            {medicalRecord?.medicationsInUse ? (
              <p className="text-sm whitespace-pre-wrap">
                {medicalRecord.medicationsInUse}
              </p>
            ) : (
              <EmptyText>Nenhum medicamento em uso registrado.</EmptyText>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            Últimos diagnósticos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {latestDiagnoses.length === 0 ? (
            <EmptyText>Nenhum diagnóstico registrado.</EmptyText>
          ) : (
            latestDiagnoses.map((diagnosis) => (
              <div
                key={diagnosis.id}
                className="flex items-start justify-between gap-2 border-b pb-2 last:border-b-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {diagnosis.description}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {formatDate(diagnosis.date)}
                    {diagnosis.cid10Code ? ` · CID ${diagnosis.cid10Code}` : ""}
                  </p>
                </div>
                <Badge variant="outline">
                  {diagnosisStatusLabels[diagnosis.status]}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-4 w-4" />
            Prescrições recentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {latestPrescriptions.length === 0 ? (
            <EmptyText>Nenhuma prescrição registrada.</EmptyText>
          ) : (
            latestPrescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className="border-b pb-2 last:border-b-0 last:pb-0"
              >
                <p className="text-sm font-medium">{prescription.medication}</p>
                <p className="text-muted-foreground text-xs">
                  {[prescription.dosage, prescription.frequency, prescription.duration]
                    .filter(Boolean)
                    .join(" · ") || formatDate(prescription.date)}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Acompanhamentos em aberto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {openFollowUps.length === 0 ? (
            <EmptyText>Nenhum acompanhamento em aberto.</EmptyText>
          ) : (
            openFollowUps.map((followUp) => (
              <div
                key={followUp.id}
                className="flex items-center justify-between gap-2 border-b pb-2 last:border-b-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {followUp.title}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Retorno previsto: {formatDate(followUp.scheduledDate)}
                  </p>
                </div>
                <Badge variant="outline">
                  {followUpStatusLabels[followUp.status]}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
