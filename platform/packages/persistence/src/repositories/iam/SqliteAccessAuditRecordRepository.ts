import type { AccessAuditRecord, AccessAuditRecordRepository, Identity } from "@abp/platform-services";
import type { DatabaseSync } from "node:sqlite";
import { fromMs, toMs } from "../../db/sqlUtil.js";

interface AccessAuditRecordRow {
  identity: string;
  tenant_id: string;
  action: string;
  granted: number;
  recorded_at: number;
}

function toAccessAuditRecord(row: AccessAuditRecordRow): AccessAuditRecord {
  return { identity: row.identity, tenantId: row.tenant_id, action: row.action, granted: row.granted === 1, recordedAt: fromMs(row.recorded_at) };
}

/** Implementação real de `AccessAuditRecordRepository` (`@abp/platform-services`) — nunca redefine o contrato, apenas o satisfaz contra SQLite. Registro imutável — nenhum `update`/`remove` no contrato, nenhum aqui. */
export class SqliteAccessAuditRecordRepository implements AccessAuditRecordRepository {
  constructor(private readonly db: DatabaseSync) {}

  async create(record: AccessAuditRecord): Promise<AccessAuditRecord> {
    this.db
      .prepare("INSERT INTO access_audit_records (identity, tenant_id, action, granted, recorded_at) VALUES (?, ?, ?, ?, ?)")
      .run(record.identity, record.tenantId, record.action, record.granted ? 1 : 0, toMs(record.recordedAt));
    return record;
  }

  async listByIdentity(identity: Identity): Promise<AccessAuditRecord[]> {
    const rows = this.db.prepare("SELECT identity, tenant_id, action, granted, recorded_at FROM access_audit_records WHERE identity = ? ORDER BY id ASC").all(identity) as unknown as AccessAuditRecordRow[];
    return rows.map(toAccessAuditRecord);
  }
}
