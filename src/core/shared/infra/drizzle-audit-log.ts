import { db } from "@/db";
import { auditLogsTable } from "@/db/schema";

import { AuditEntry, AuditLog } from "../application/ports/audit-log";

/**
 * Adapter de auditoria que persiste os eventos via Drizzle.
 * É "best-effort": uma falha ao auditar não deve derrubar a operação principal,
 * por isso o erro é logado e engolido.
 */
export class DrizzleAuditLog implements AuditLog {
  async record(entry: AuditEntry): Promise<void> {
    try {
      await db.insert(auditLogsTable).values({
        clinicId: entry.clinicId ?? null,
        actorUserId: entry.actorUserId ?? null,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        metadata: entry.metadata ?? null,
      });
    } catch (error) {
      console.error("[audit] falha ao registrar evento:", entry.action, error);
    }
  }
}
