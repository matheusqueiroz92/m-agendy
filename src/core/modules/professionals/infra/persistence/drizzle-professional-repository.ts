import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  doctorAvailabilityWindowsTable,
  doctorsTable,
} from "@/db/schema";

import { Professional } from "../../domain/professional";
import { ProfessionalRepository } from "../../application/ports/professional-repository";

/**
 * Adapter Drizzle da porta ProfessionalRepository. A tabela física continua
 * sendo `doctors` (sem rename de banco); o mapeamento acontece aqui.
 */
export class DrizzleProfessionalRepository implements ProfessionalRepository {
  async findById(id: string): Promise<Professional | null> {
    const row = await db.query.doctorsTable.findFirst({
      where: eq(doctorsTable.id, id),
      with: { availabilityWindows: true },
    });

    if (!row) {
      return null;
    }

    return Professional.restore({
      id: row.id,
      clinicId: row.clinicId,
      name: row.name,
      speciality: row.speciality,
      phoneNumber: row.phoneNumber,
      avatarImageUrl: row.avatarImageUrl,
      appointmentPriceInCents: row.appointmentPriceInCents,
      defaultAppointmentDurationInMinutes:
        row.defaultAppointmentDurationInMinutes,
      availabilityWindows: row.availabilityWindows.map((window) => ({
        weekDay: window.weekDay,
        startTime: window.startTime,
        endTime: window.endTime,
      })),
    });
  }

  async countByClinic(clinicId: string): Promise<number> {
    const rows = await db.query.doctorsTable.findMany({
      where: eq(doctorsTable.clinicId, clinicId),
      columns: { id: true },
    });
    return rows.length;
  }

  async save(professional: Professional): Promise<void> {
    const data = professional.toPrimitives();

    await db.transaction(async (tx) => {
      await tx
        .insert(doctorsTable)
        .values({
          id: data.id,
          clinicId: data.clinicId,
          name: data.name,
          speciality: data.speciality,
          phoneNumber: data.phoneNumber,
          avatarImageUrl: data.avatarImageUrl,
          appointmentPriceInCents: data.appointmentPriceInCents,
          defaultAppointmentDurationInMinutes:
            data.defaultAppointmentDurationInMinutes,
        })
        .onConflictDoUpdate({
          target: [doctorsTable.id],
          set: {
            name: data.name,
            speciality: data.speciality,
            phoneNumber: data.phoneNumber,
            avatarImageUrl: data.avatarImageUrl,
            appointmentPriceInCents: data.appointmentPriceInCents,
            defaultAppointmentDurationInMinutes:
              data.defaultAppointmentDurationInMinutes,
            updatedAt: new Date(),
          },
        });

      await tx
        .delete(doctorAvailabilityWindowsTable)
        .where(eq(doctorAvailabilityWindowsTable.doctorId, data.id));

      if (data.availabilityWindows.length > 0) {
        await tx.insert(doctorAvailabilityWindowsTable).values(
          data.availabilityWindows.map((window) => ({
            doctorId: data.id,
            weekDay: window.weekDay,
            startTime: window.startTime,
            endTime: window.endTime,
          })),
        );
      }
    });
  }

  async delete(id: string): Promise<void> {
    await db.delete(doctorsTable).where(eq(doctorsTable.id, id));
  }
}
