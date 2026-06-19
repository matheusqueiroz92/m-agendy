import { and, count, desc, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { notificationsTable } from "@/db/schema";

import {
  NotificationReader,
  NotificationView,
} from "../../application/ports/notification-reader";

/** Adapter Drizzle de leitura/baixa de notificações da clínica. */
export class DrizzleNotificationReader implements NotificationReader {
  async listByClinic(
    clinicId: string,
    limit = 50,
  ): Promise<NotificationView[]> {
    const rows = await db.query.notificationsTable.findMany({
      where: eq(notificationsTable.clinicId, clinicId),
      orderBy: [desc(notificationsTable.createdAt)],
      limit,
    });

    return rows.map((row) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      appointmentId: row.appointmentId,
      readAt: row.readAt,
      createdAt: row.createdAt,
    }));
  }

  async countUnread(clinicId: string): Promise<number> {
    const [row] = await db
      .select({ value: count() })
      .from(notificationsTable)
      .where(
        and(
          eq(notificationsTable.clinicId, clinicId),
          isNull(notificationsTable.readAt),
        ),
      );

    return row?.value ?? 0;
  }

  async markAllRead(clinicId: string): Promise<void> {
    await db
      .update(notificationsTable)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(notificationsTable.clinicId, clinicId),
          isNull(notificationsTable.readAt),
        ),
      );
  }
}
