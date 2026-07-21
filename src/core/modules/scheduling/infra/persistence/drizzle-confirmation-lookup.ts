import { and, asc, eq, gte } from "drizzle-orm";

import { db } from "@/db";
import { appointmentsTable, patientsTable } from "@/db/schema";
import { toE164BR } from "@/core/shared/domain/phone-number";

import {
  ConfirmableAppointment,
  ConfirmationLookup,
} from "../../application/ports/confirmation-lookup";

/**
 * Adapter Drizzle: a partir do telefone, acha o paciente e TODAS as consultas
 * pendentes (futuras). Compara telefones normalizados (DDI 55 + só dígitos)
 * para tolerar máscara — o telefone do paciente é cadastrado sem código do
 * país, mas o número que chega da Meta já vem com ele.
 */
export class DrizzleConfirmationLookup implements ConfirmationLookup {
  async findConfirmableAppointmentsByPhone(params: {
    phone: string;
    now: Date;
  }): Promise<ConfirmableAppointment[]> {
    const target = toE164BR(params.phone);

    const candidates = await db.query.patientsTable.findMany({
      columns: { id: true, name: true, phoneNumber: true },
    });

    const patient = candidates.find(
      (candidate) => toE164BR(candidate.phoneNumber) === target,
    );

    if (!patient) {
      return [];
    }

    const appointments = await db.query.appointmentsTable.findMany({
      where: and(
        eq(appointmentsTable.patientId, patient.id),
        eq(appointmentsTable.status, "pending"),
        gte(appointmentsTable.date, params.now),
      ),
      orderBy: [asc(appointmentsTable.date)],
    });

    return appointments.map((appointment) => ({
      appointmentId: appointment.id,
      clinicId: appointment.clinicId,
      patientName: patient.name,
      scheduledAt: appointment.date,
    }));
  }
}
