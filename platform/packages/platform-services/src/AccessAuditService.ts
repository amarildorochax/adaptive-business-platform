import type { AccessAuditRecord } from './AccessAuditRecord';
import type { AccessAuditRecordRepository } from './AccessAuditRecordRepository';
import type { Identity } from './Identity';

/** Access Audit Service — "toda decisão de acesso, concedida ou negada, é auditada" (`IDENTITY_HUB.md`, ADR-007) — nenhuma exceção configurável. */
export class AccessAuditService {
  constructor(private readonly repository: AccessAuditRecordRepository) {}

  async record(identity: Identity, tenantId: string, action: string, granted: boolean): Promise<AccessAuditRecord> {
    return this.repository.create({ identity, tenantId, action, granted, recordedAt: new Date() });
  }

  async listByIdentity(identity: Identity): Promise<readonly AccessAuditRecord[]> {
    return this.repository.listByIdentity(identity);
  }
}
