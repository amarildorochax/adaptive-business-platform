import type { AccessAuditRecord } from './AccessAuditRecord';
import type { Identity } from './Identity';

/** Contrato de persistência de Access Audit Record — apenas o contrato. Sem `update`/`remove` — registro imutável (ADR-007, "toda decisão de acesso, concedida ou negada, é auditada"). */
export interface AccessAuditRecordRepository {
  create(record: AccessAuditRecord): Promise<AccessAuditRecord>;
  listByIdentity(identity: Identity): Promise<AccessAuditRecord[]>;
}
