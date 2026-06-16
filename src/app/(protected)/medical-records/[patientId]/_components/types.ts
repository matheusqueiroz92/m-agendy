import {
  appointmentsTable,
  clinicalAttendancesTable,
  diagnosesTable,
  doctorsTable,
  followUpsTable,
  medicalRecordsTable,
  patientsTable,
  prescriptionsTable,
} from "@/db/schema";

export type Patient = typeof patientsTable.$inferSelect;
export type Doctor = typeof doctorsTable.$inferSelect;
export type MedicalRecord = typeof medicalRecordsTable.$inferSelect;
export type Diagnosis = typeof diagnosesTable.$inferSelect;
export type FollowUp = typeof followUpsTable.$inferSelect;

export type AppointmentWithDoctor = typeof appointmentsTable.$inferSelect & {
  doctor: Doctor;
};

export type AttendanceWithDoctor = typeof clinicalAttendancesTable.$inferSelect & {
  doctor: Doctor | null;
};

export type PrescriptionWithDoctor = typeof prescriptionsTable.$inferSelect & {
  doctor: Doctor | null;
};
