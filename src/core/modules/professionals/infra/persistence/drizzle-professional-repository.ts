import { count, eq } from "drizzle-orm";

import { db } from "@/db";
import { doctorsTable } from "@/db/schema";

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
      availableFromWeekDay: row.availableFromWeekDay,
      availableToWeekDay: row.availableToWeekDay,
      availableFromTime: row.availableFromTime,
      availableToTime: row.availableToTime,
    });
  }

  async countByClinic(clinicId: string): Promise<number> {
    const [row] = await db
      .select({ value: count() })
      .from(doctorsTable)
      .where(eq(doctorsTable.clinicId, clinicId));
    return row?.value ?? 0;
  }

  async save(professional: Professional): Promise<void> {
    const data = professional.toPrimitives();

    await db
      .insert(doctorsTable)
      .values({
        id: data.id,
        clinicId: data.clinicId,
        name: data.name,
        speciality: data.speciality,
        phoneNumber: data.phoneNumber,
        avatarImageUrl: data.avatarImageUrl,
        appointmentPriceInCents: data.appointmentPriceInCents,
        availableFromWeekDay: data.availableFromWeekDay,
        availableToWeekDay: data.availableToWeekDay,
        availableFromTime: data.availableFromTime,
        availableToTime: data.availableToTime,
      })
      .onConflictDoUpdate({
        target: [doctorsTable.id],
        set: {
          name: data.name,
          speciality: data.speciality,
          phoneNumber: data.phoneNumber,
          avatarImageUrl: data.avatarImageUrl,
          appointmentPriceInCents: data.appointmentPriceInCents,
          availableFromWeekDay: data.availableFromWeekDay,
          availableToWeekDay: data.availableToWeekDay,
          availableFromTime: data.availableFromTime,
          availableToTime: data.availableToTime,
          updatedAt: new Date(),
        },
      });
  }

  async delete(id: string): Promise<void> {
    await db.delete(doctorsTable).where(eq(doctorsTable.id, id));
  }
}
