import type { AuditRecord } from './AuditRecord';

/** Contrato de persistência de Audit Record — apenas o contrato. Sem `update`/`remove` — registro imutável (`AUTOMATION_ENGINE.md`, Capítulo 16). */
export interface AuditRecordRepository {
  create(record: AuditRecord): Promise<AuditRecord>;
  list(subjectId: string): Promise<AuditRecord[]>;
}
