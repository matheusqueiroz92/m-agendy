import { eq } from "drizzle-orm";

import { db } from "@/db";
import { doctorsTable, patientsTable } from "@/db/schema";
import { toE164BR } from "@/core/shared/domain/phone-number";

import { computeAvailableSlots } from "../../domain/availability";
import { ChatbotOption } from "../../domain/chatbot";
import {
  ChatAvailability,
  ChatClinicResolver,
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

    const patients = await db.query.patientsTable.findMany({
      where: eq(patientsTable.clinicId, params.clinicId),
      columns: { id: true, name: true, phoneNumber: true },
    });

    const patient = patients.find(
      (candidate) => toE164BR(candidate.phoneNumber) === target,
    );

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

/**
 * Resolve a clínica do número de entrada. Hoje usa um padrão por variável de
 * ambiente; quando cada clínica tiver seu número, mapear o phone_number_id.
 */
export class EnvChatClinicResolver implements ChatClinicResolver {
  async resolveInboundClinicId(_params: {
    phoneNumberId?: string | null;
  }): Promise<string | null> {
    void _params;
    return process.env.WHATSAPP_DEFAULT_CLINIC_ID ?? null;
  }
}

