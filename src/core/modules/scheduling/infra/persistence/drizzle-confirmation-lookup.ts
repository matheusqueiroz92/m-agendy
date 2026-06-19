import { and, asc, eq, gte } from "drizzle-orm";

import { db } from "@/db";
import { appointmentsTable, patientsTable } from "@/db/schema";

import {
  ConfirmableAppointment,
  ConfirmationLookup,
} from "../../application/ports/confirmation-lookup";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

/**
 * Adapter Drizzle: a partir do telefone, acha o paciente e a próxima consulta
 * pendente (futura). Compara telefones apenas por dígitos para tolerar máscara.
 */
export class DrizzleConfirmationLookup implements ConfirmationLookup {
  async findConfirmableByPhone(params: {
    phone: string;
    now: Date;
  }): Promise<ConfirmableAppointment | null> {
    const target = onlyDigits(params.phone);

    const candidates = await db.query.patientsTable.findMany({
      columns: { id: true, name: true, phoneNumber: true },
    });

    const patient = candidates.find(
      (candidate) => onlyDigits(candidate.phoneNumber) === target,
    );

    if (!patient) {
      return null;
    }

    const appointment = await db.query.appointmentsTable.findFirst({
      where: and(
        eq(appointmentsTable.patientId, patient.id),
        eq(appointmentsTable.status, "pending"),
        gte(appointmentsTable.date, params.now),
      ),
      orderBy: [asc(appointmentsTable.date)],
    });

    if (!appointment) {
      return null;
    }

    return {
      appointmentId: appointment.id,
      clinicId: appointment.clinicId,
      patientName: patient.name,
      scheduledAt: appointment.date,
    };
  }
}
