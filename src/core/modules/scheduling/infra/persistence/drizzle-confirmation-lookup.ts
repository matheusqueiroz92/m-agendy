import { and, asc, eq, gte, sql } from "drizzle-orm";

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
 *
 * O filtro por telefone roda no banco (não carrega todos os pacientes de
 * todas as clínicas em memória para comparar um a um em JS, como antes) —
 * essencial aqui porque essa busca não é restrita a uma clínica: toda
 * mensagem recebida no webhook do WhatsApp passa por aqui antes de saber a
 * qual clínica ela pertence.
 */
export class DrizzleConfirmationLookup implements ConfirmationLookup {
  async findConfirmableAppointmentsByPhone(params: {
    phone: string;
    now: Date;
  }): Promise<ConfirmableAppointment[]> {
    const target = toE164BR(params.phone);
    const withoutCountryCode =
      target.length >= 12 && target.startsWith("55")
        ? target.slice(2)
        : target;

    // Compara ignorando qualquer máscara já salva (espaço, parênteses, "+",
    // etc.) contra as duas formas possíveis do telefone recebido (com e sem
    // DDI) — mesma tolerância que toE164BR dava ao comparar em JS.
    const normalizedPhone = sql`regexp_replace(${patientsTable.phoneNumber}, '\\D', '', 'g')`;

    const [patient] = await db
      .select({ id: patientsTable.id, name: patientsTable.name })
      .from(patientsTable)
      .where(sql`${normalizedPhone} IN (${target}, ${withoutCountryCode})`)
      .limit(1);

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
