"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  doctorAvailabilityWindowsTable,
  doctorsTable,
  patientsTable,
} from "@/db/schema";

import { AppointmentsTable } from "./appointments-table";
import { ScheduleBoard } from "./schedule-board/schedule-board";

type DoctorWithWindows = typeof doctorsTable.$inferSelect & {
  availabilityWindows?: (typeof doctorAvailabilityWindowsTable.$inferSelect)[];
};

type AppointmentWithRelations = typeof import("@/db/schema").appointmentsTable.$inferSelect & {
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

interface AppointmentsViewTabsProps {
  doctors: DoctorWithWindows[];
  patients: (typeof patientsTable.$inferSelect)[];
  appointments: AppointmentWithRelations[];
}

function ViewTabsList() {
  return (
    <TabsList>
      <TabsTrigger value="board">Quadro</TabsTrigger>
      <TabsTrigger value="list">Lista</TabsTrigger>
    </TabsList>
  );
}

export function AppointmentsViewTabs({
  doctors,
  patients,
  appointments,
}: AppointmentsViewTabsProps) {
  return (
    <Tabs defaultValue="board" className="w-full">
      <TabsContent value="board" className="mt-0">
        <ScheduleBoard
          doctors={doctors}
          patients={patients}
          appointments={appointments}
          toolbarLeading={<ViewTabsList />}
        />
      </TabsContent>
      <TabsContent value="list" className="mt-0 space-y-4">
        <ViewTabsList />
        <AppointmentsTable
          appointments={appointments}
          doctors={doctors}
          patients={patients}
        />
      </TabsContent>
    </Tabs>
  );
}
