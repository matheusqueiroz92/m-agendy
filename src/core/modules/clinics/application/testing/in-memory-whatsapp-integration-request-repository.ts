import { WhatsAppIntegrationRequest } from "../../domain/whatsapp-integration-request";
import {
  WhatsAppIntegrationRequestListItem,
  WhatsAppIntegrationRequestRepository,
} from "../ports/whatsapp-integration-request-repository";

/** WhatsAppIntegrationRequestRepository em memória para testes. */
export class InMemoryWhatsAppIntegrationRequestRepository
  implements WhatsAppIntegrationRequestRepository
{
  public items: WhatsAppIntegrationRequest[] = [];
  /** Metadados de clínica usados só para compor o read model de `listAll`. */
  public clinicInfo = new Map<
    string,
    { name: string; plan: string | null; ownerPhoneNumber?: string | null }
  >();

  async findPendingByClinic(
    clinicId: string,
  ): Promise<WhatsAppIntegrationRequest | null> {
    return (
      this.items.find((r) => r.clinicId === clinicId && r.isPending) ?? null
    );
  }

  async findById(id: string): Promise<WhatsAppIntegrationRequest | null> {
    return this.items.find((r) => r.id === id) ?? null;
  }

  async save(request: WhatsAppIntegrationRequest): Promise<void> {
    const index = this.items.findIndex((r) => r.id === request.id);
    if (index === -1) {
      this.items.push(request);
    } else {
      this.items[index] = request;
    }
  }

  async listAll(): Promise<WhatsAppIntegrationRequestListItem[]> {
    return this.items.map((request) => {
      const info = this.clinicInfo.get(request.clinicId);
      const p = request.toPrimitives();
      return {
        id: p.id,
        clinicId: p.clinicId,
        clinicName: info?.name ?? "",
        clinicPlan: info?.plan ?? null,
        ownerPhoneNumber: info?.ownerPhoneNumber ?? null,
        status: p.status,
        phoneNumberId: p.phoneNumberId,
        createdAt: p.createdAt,
        completedAt: p.completedAt,
      };
    });
  }
}
