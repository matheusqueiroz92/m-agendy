import { AuditEntry, AuditLog } from "../ports/audit-log";

/** AuditLog fake que registra as entradas em memória, para asserções. */
export class FakeAuditLog implements AuditLog {
  public readonly entries: AuditEntry[] = [];

  async record(entry: AuditEntry): Promise<void> {
    this.entries.push(entry);
  }
}
