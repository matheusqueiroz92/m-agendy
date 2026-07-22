import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { doctorsTable, patientsTable } from "@/db/schema";
import { toE164BR } from "@/core/shared/domain/phone-number";

import { computeAvailableSlots } from "../../domain/availability";
import { ChatbotOption } from "../../domain/chatbot";
import {
  ChatAvailability,
  ChatPatientLookup,
  ChatProfessionalsCatalog,
} from "../../application/ports/chatbot-ports";
import { DrizzleAvailabilityReader } from "../persistence/drizzle-availability-reader";

/** Lista de profissionais da clínica para o chatbot. */
export class DrizzleChatProfessionalsCatalog
  implements ChatProfessionalsCatalog
{
  async listByClinic(clinicId: string): Promise<ChatbotOption[]> {
    const doctors = await db.query.doctorsTable.findMany({
      where: eq(doctorsTable.clinicId, clinicId),
      orderBy: (doctors, { asc }) => [asc(doctors.name)],
    });

    return doctors.map((doctor) => ({
      id: doctor.id,
      label: `${doctor.name} · ${doctor.speciality}`,
    }));
  }
}

/**
 * Identifica o paciente da clínica pelo telefone (comparando números
 * normalizados — DDI 55 + só dígitos — para tolerar máscara e a ausência do
 * código do país no cadastro).
 */
export class DrizzleChatPatientLookup implements ChatPatientLookup {
  async findByPhone(params: {
    clinicId: string;
    phone: string;
  }): Promise<{ patientId: string; name: string } | null> {
    const target = toE164BR(params.phone);
    const withoutCountryCode =
      target.length >= 12 && target.startsWith("55")
        ? target.slice(2)
        : target;

    const normalizedPhone = sql`regexp_replace(${patientsTable.phoneNumber}, '\\D', '', 'g')`;

    const [patient] = await db
      .select({ id: patientsTable.id, name: patientsTable.name })
      .from(patientsTable)
      .where(
        and(
          eq(patientsTable.clinicId, params.clinicId),
          sql`${normalizedPhone} IN (${target}, ${withoutCountryCode})`,
        ),
      )
      .limit(1);

    return patient ? { patientId: patient.id, name: patient.name } : null;
  }
}

/** Horários livres para o chatbot, reusando o leitor de disponibilidade. */
export class DrizzleChatAvailability implements ChatAvailability {
  private readonly reader = new DrizzleAvailabilityReader();

  async listFreeTimes(params: {
    clinicId: string;
    doctorId: string;
    dateISO: string;
  }): Promise<string[]> {
    const availability = await this.reader.getAvailability({
      clinicId: params.clinicId,
      doctorId: params.doctorId,
    });
    if (!availability) return [];

    const occupied = await this.reader.getOccupiedIntervals({
      clinicId: params.clinicId,
      doctorId: params.doctorId,
      date: params.dateISO,
    });

    const duration = availability.defaultAppointmentDurationInMinutes;

    return computeAvailableSlots(
      params.dateISO,
      availability.windows,
      occupied,
      duration,
    )
      .filter((slot) => slot.available)
      .map((slot) => slot.time);
  }
}

