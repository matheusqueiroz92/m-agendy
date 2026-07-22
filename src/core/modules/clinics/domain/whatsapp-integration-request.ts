import { ForbiddenError } from "@/core/shared/domain/errors";

import { ClinicValidationError } from "./errors";

export type WhatsAppIntegrationRequestStatus = "pending" | "completed";

export interface WhatsAppIntegrationRequestProps {
  id: string;
  clinicId: string;
  status: WhatsAppIntegrationRequestStatus;
  phoneNumberId: string | null;
  createdAt: Date;
  completedAt: Date | null;
}

/**
 * Solicitação de integração de número de WhatsApp próprio da clínica
 * (planos Premium/Gold). Fluxo unificado: a clínica pede, e a equipe do
 * M.Agendy (após configurar manualmente no Meta Business Manager) conclui a
 * solicitação já gravando o `phone_number_id` obtido — sem etapa
 * intermediária de "em andamento".
 *
 * Não conhece Drizzle nem a UI. Regras que dependem de outros agregados (ex.:
 * a clínica já ter uma solicitação pendente, ou já ter número próprio, ou não
 * ter plano que libere o recurso) ficam nos casos de uso.
 */
export class WhatsAppIntegrationRequest {
  private constructor(private readonly props: WhatsAppIntegrationRequestProps) {}

  /** Cria uma nova solicitação, sempre pendente e sem número. */
  static create(input: { id?: string; clinicId: string }): WhatsAppIntegrationRequest {
    return new WhatsAppIntegrationRequest({
      id: input.id ?? crypto.randomUUID(),
      clinicId: input.clinicId,
      status: "pending",
      phoneNumberId: null,
      createdAt: new Date(),
      completedAt: null,
    });
  }

  /** Reidrata uma solicitação já persistida (sem revalidar invariantes). */
  static restore(props: WhatsAppIntegrationRequestProps): WhatsAppIntegrationRequest {
    return new WhatsAppIntegrationRequest(props);
  }

  /** Retorna uma cópia concluída, com o phone_number_id gravado. */
  complete(phoneNumberId: string): WhatsAppIntegrationRequest {
    if (this.props.status === "completed") {
      throw new ForbiddenError("Esta solicitação já foi concluída.");
    }

    const trimmed = phoneNumberId.trim();
    if (!trimmed) {
      throw new ClinicValidationError(
        "O phone_number_id é obrigatório para concluir a solicitação.",
      );
    }

    return new WhatsAppIntegrationRequest({
      ...this.props,
      status: "completed",
      phoneNumberId: trimmed,
      completedAt: new Date(),
    });
  }

  get id(): string {
    return this.props.id;
  }

  get clinicId(): string {
    return this.props.clinicId;
  }

  get status(): WhatsAppIntegrationRequestStatus {
    return this.props.status;
  }

  get isPending(): boolean {
    return this.props.status === "pending";
  }

  get phoneNumberId(): string | null {
    return this.props.phoneNumberId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get completedAt(): Date | null {
    return this.props.completedAt;
  }

  toPrimitives(): WhatsAppIntegrationRequestProps {
    return { ...this.props };
  }
}
