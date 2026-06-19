import { eq } from "drizzle-orm";

import { db } from "@/db";
import { followUpsTable } from "@/db/schema";

import { FollowUp } from "../../domain/follow-up";
import { FollowUpRepository } from "../../application/ports/follow-up-repository";

/** Adapter Drizzle de acompanhamentos. */
export class DrizzleFollowUpRepository implements FollowUpRepository {
  async findById(id: string): Promise<FollowUp | null> {
    const row = await db.query.followUpsTable.findFirst({
      where: eq(followUpsTable.id, id),
    });

    if (!row) {
      return null;
    }

    return FollowUp.restore({
      id: row.id,
      clinicId: row.clinicId,
      patientId: row.patientId,
      title: row.title,
      description: row.description,
      status: row.status,
      scheduledDate: row.scheduledDate,
      completedDate: row.completedDate,
    });
  }

  async save(followUp: FollowUp): Promise<void> {
    const data = followUp.toPrimitives();

    await db
      .insert(followUpsTable)
      .values({
        id: data.id,
        clinicId: data.clinicId,
        patientId: data.patientId,
        title: data.title,
        description: data.description,
        status: data.status,
        scheduledDate: data.scheduledDate,
        completedDate: data.completedDate,
      })
      .onConflictDoUpdate({
        target: [followUpsTable.id],
        set: {
          title: data.title,
          description: data.description,
          status: data.status,
          scheduledDate: data.scheduledDate,
          completedDate: data.completedDate,
          updatedAt: new Date(),
        },
      });
  }

  async delete(id: string): Promise<void> {
    await db.delete(followUpsTable).where(eq(followUpsTable.id, id));
  }
}
