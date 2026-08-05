import type { ExecutionHistoryRecord, ExecutionOutcome } from './ExecutionHistoryRecord';
import type { ExecutionHistoryRecordRepository } from './ExecutionHistoryRecordRepository';

/**
 * ExecutionHistoryRecordService — adaptado, na distinção central, de
 * `src/core/automations/AutomationExecution.ts` (`status: "completed" | "skipped"`, Automation
 * Center legado): o legado já reconhecia que uma execução "apta mas sem ação" é diferente de uma
 * execução mal-sucedida — o Blueprint já aprovado formaliza essa mesma distinção com um terceiro
 * valor explícito, `NoActionTaken`, nunca confundido com `Failure` (Um Branch Não Satisfeito É
 * Conclusão Sem Ação, ADR-012). Nenhuma emissão de Evento/Audit aqui.
 */
export class ExecutionHistoryRecordService {
  constructor(private readonly repository: ExecutionHistoryRecordRepository) {}

  async record(executionId: string, workflowId: string, outcome: ExecutionOutcome): Promise<ExecutionHistoryRecord> {
    const record: ExecutionHistoryRecord = { executionId, workflowId, outcome, completedAt: new Date() };
    return this.repository.create(record);
  }

  async list(workflowId: string): Promise<readonly ExecutionHistoryRecord[]> {
    return this.repository.list(workflowId);
  }
}
