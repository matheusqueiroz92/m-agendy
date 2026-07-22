import {
  WhatsAppIntegrationRequest,
  WhatsAppIntegrationRequestStatus,
} from "../../domain/whatsapp-integration-request";

/** Item da listagem administrativa de solicitações (read model). */
export interface WhatsAppIntegrationRequestListItem {
  id: string;
  clinicId: string;
  clinicName: string;
  /** Plano "de base" da clínica (assinatura do dono), para o admin priorizar. */
  clinicPlan: string | null;
  /** Telefone do responsável pela clínica, para facilitar o cadastro no WABA. */
  ownerPhoneNumber: string | null;
  status: WhatsAppIntegrationRequestStatus;
  phoneNumberId: string | null;
  createdAt: Date;
  completedAt: Date | null;
}

/**
 * Porta de persistência das solicitações de integração de número próprio de
 * WhatsApp. Concentra leitura administrativa (com dados da clínica já
 * juntados) e mutações, sem acoplar ao Drizzle.
 */
export interface WhatsAppIntegrationRequestRepository {
  /** Solicitação pendente ativa da clínica, se houver (no máx. uma por vez). */
  findPendingByClinic(clinicId: string): Promise<WhatsAppIntegrationRequest | null>;
  findById(id: string): Promise<WhatsAppIntegrationRequest | null>;
  /** Insere ou atualiza (upsert por id). */
  save(request: WhatsAppIntegrationRequest): Promise<void>;
  listAll(): Promise<WhatsAppIntegrationRequestListItem[]>;
}
