import type { AuditedOperation, AuditRecord } from './AuditRecord';
import type { AuditRecordRepository } from './AuditRecordRepository';

/**
 * AuditRecordService — o mecanismo que esta Sprint usa no lugar de um catálogo de Commands/Events,
 * que `AUTOMATION_ENGINE.md` nunca definiu para este Hub (ver Nota de Posicionamento do relatório
 * desta Sprint). Toda mudança relevante de Workflow, e toda decisão de aprovação através do Approval
 * Engine (fora de escopo nesta Sprint), produz um Audit Record imutável (Capítulo 16).
 */
export class AuditRecordService {
  constructor(private readonly repository: AuditRecordRepository) {}

  async record(operation: AuditedOperation, subjectId: string, performedByIdentityId: string): Promise<AuditRecord> {
    const record: AuditRecord = {
      auditRecordId: crypto.randomUUID(),
      operation,
      subjectId,
      performedByIdentityId,
      occurredAt: new Date(),
    };

    return this.repository.create(record);
  }

  async list(subjectId: string): Promise<readonly AuditRecord[]> {
    return this.repository.list(subjectId);
  }
}
