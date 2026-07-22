import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  usersToClinicsTable,
  whatsappIntegrationRequestsTable,
} from "@/db/schema";

import { WhatsAppIntegrationRequest } from "../../domain/whatsapp-integration-request";
import {
  WhatsAppIntegrationRequestListItem,
  WhatsAppIntegrationRequestRepository,
} from "../../application/ports/whatsapp-integration-request-repository";

/** Adapter Drizzle da porta `WhatsAppIntegrationRequestRepository`. */
export class DrizzleWhatsAppIntegrationRequestRepository
  implements WhatsAppIntegrationRequestRepository
{
  async findPendingByClinic(
    clinicId: string,
  ): Promise<WhatsAppIntegrationRequest | null> {
    const row = await db.query.whatsappIntegrationRequestsTable.findFirst({
      where: and(
        eq(whatsappIntegrationRequestsTable.clinicId, clinicId),
        eq(whatsappIntegrationRequestsTable.status, "pending"),
      ),
    });
    return row ? WhatsAppIntegrationRequest.restore(row) : null;
  }

  async findById(id: string): Promise<WhatsAppIntegrationRequest | null> {
    const row = await db.query.whatsappIntegrationRequestsTable.findFirst({
      where: eq(whatsappIntegrationRequestsTable.id, id),
    });
    return row ? WhatsAppIntegrationRequest.restore(row) : null;
  }

  async save(request: WhatsAppIntegrationRequest): Promise<void> {
    const p = request.toPrimitives();
    await db
      .insert(whatsappIntegrationRequestsTable)
      .values(p)
      .onConflictDoUpdate({
        target: whatsappIntegrationRequestsTable.id,
        set: {
          status: p.status,
          phoneNumberId: p.phoneNumberId,
          completedAt: p.completedAt,
        },
      });
  }

  async listAll(): Promise<WhatsAppIntegrationRequestListItem[]> {
    // Primeiro dono encontrado por clínica, só para exibir o plano de base
    // (mesmo critério do AdminClinicRepository).
    const owners = await db.query.usersToClinicsTable.findMany({
      where: eq(usersToClinicsTable.role, "owner"),
      with: { user: true },
    });
    const planByClinic = new Map<string, string | null>();
    for (const o of owners) {
      if (!planByClinic.has(o.clinicId)) {
        planByClinic.set(o.clinicId, o.user?.plan ?? null);
      }
    }

    const rows = await db.query.whatsappIntegrationRequestsTable.findMany({
      with: { clinic: { columns: { name: true } } },
      orderBy: (r, { desc }) => [desc(r.createdAt)],
    });

    return rows.map((row) => ({
      id: row.id,
      clinicId: row.clinicId,
      clinicName: row.clinic.name,
      clinicPlan: planByClinic.get(row.clinicId) ?? null,
      status: row.status,
      phoneNumberId: row.phoneNumberId,
      createdAt: row.createdAt,
      completedAt: row.completedAt,
    }));
  }
}
