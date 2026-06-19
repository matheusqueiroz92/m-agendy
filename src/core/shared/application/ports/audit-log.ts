export interface AuditEntry {
  /** Clínica afetada. Nulo para ações de plataforma (admin global). */
  clinicId?: string | null;
  /** Usuário que executou a ação. */
  actorUserId?: string | null;
  /** Ação executada, no formato "<entidade>.<verbo>" (ex.: "patient.created"). */
  action: string;
  /** Tipo da entidade afetada (ex.: "patient"). */
  entityType?: string;
  /** Identificador da entidade afetada. */
  entityId?: string;
  /** Detalhes adicionais (diff, contexto, etc.). */
  metadata?: Record<string, unknown>;
}

/**
 * Porta de auditoria (driven port).
 *
 * Registra quem fez o quê e quando — essencial para dados sensíveis (LGPD) no
 * prontuário e para rastreabilidade das ações administrativas. O caso de uso
 * depende desta interface; a implementação concreta (Drizzle) fica em infra.
 */
export interface AuditLog {
  record(entry: AuditEntry): Promise<void>;
}
