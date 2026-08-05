import type { ExecutionHistoryRecord } from './ExecutionHistoryRecord';

/** Contrato de persistência de Execution History Record — apenas o contrato. Sem `update`/`remove` — histórico imutável, sustentando Auditabilidade (ADR-004). */
export interface ExecutionHistoryRecordRepository {
  create(record: ExecutionHistoryRecord): Promise<ExecutionHistoryRecord>;
  list(workflowId: string): Promise<ExecutionHistoryRecord[]>;
}
