"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AntecedentsTab } from "./antecedents-tab";
import { AppointmentsHistory } from "./appointments-history";
import { AttendancesTab } from "./attendances-tab";
import { DiagnosesTab } from "./diagnoses-tab";
import { FollowUpsTab } from "./follow-ups-tab";
import { OverviewTab } from "./overview-tab";
import { PrescriptionsTab } from "./prescriptions-tab";
import {
  AppointmentWithDoctor,
  AttendanceWithDoctor,
  Diagnosis,
  Doctor,
  FollowUp,
  MedicalRecord,
  Patient,
  PrescriptionWithDoctor,
} from "./types";

interface MedicalRecordTabsProps {
  patient: Patient;
  medicalRecord: MedicalRecord | null;
  appointments: AppointmentWithDoctor[];
  attendances: AttendanceWithDoctor[];
  diagnoses: Diagnosis[];
  prescriptions: PrescriptionWithDoctor[];
  followUps: FollowUp[];
  doctors: Doctor[];
}

export const MedicalRecordTabs = ({
  patient,
  medicalRecord,
  appointments,
  attendances,
  diagnoses,
  prescriptions,
  followUps,
  doctors,
}: MedicalRecordTabsProps) => {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
        <TabsTrigger value="overview">Visão geral</TabsTrigger>
        <TabsTrigger value="appointments">Consultas</TabsTrigger>
        <TabsTrigger value="attendances">Atendimentos</TabsTrigger>
        <TabsTrigger value="follow-ups">Acompanhamentos</TabsTrigger>
        <TabsTrigger value="prescriptions">Prescrições</TabsTrigger>
        <TabsTrigger value="diagnoses">Diagnósticos</TabsTrigger>
        <TabsTrigger value="antecedents">Antecedentes</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <OverviewTab
          medicalRecord={medicalRecord}
          appointments={appointments}
          diagnoses={diagnoses}
          followUps={followUps}
          prescriptions={prescriptions}
        />
      </TabsContent>

      <TabsContent value="appointments" className="mt-6">
        <AppointmentsHistory appointments={appointments} />
      </TabsContent>

      <TabsContent value="attendances" className="mt-6">
        <AttendancesTab
          patientId={patient.id}
          attendances={attendances}
          appointments={appointments}
          doctors={doctors}
        />
      </TabsContent>

      <TabsContent value="follow-ups" className="mt-6">
        <FollowUpsTab patientId={patient.id} followUps={followUps} />
      </TabsContent>

      <TabsContent value="prescriptions" className="mt-6">
        <PrescriptionsTab
          patientId={patient.id}
          prescriptions={prescriptions}
          doctors={doctors}
        />
      </TabsContent>

      <TabsContent value="diagnoses" className="mt-6">
        <DiagnosesTab patientId={patient.id} diagnoses={diagnoses} />
      </TabsContent>

      <TabsContent value="antecedents" className="mt-6">
        <AntecedentsTab patientId={patient.id} medicalRecord={medicalRecord} />
      </TabsContent>
    </Tabs>
  );
};
