/** Registro de uma única execução de Task por um Agent, sucesso ou falha. */
export interface ExecutionRecord {
  id: string;
  agentId: string;
  taskId: string;
  provider: string;
  status: "SUCCESS" | "FAILED";
  startedAt: Date;
  finishedAt: Date;
  durationMs: number;
}

/**
 * Histórico em memória de execuções de Task, mais recente primeiro.
 *
 * Responsabilidade: registrar cada execução concluída (sucesso ou falha)
 * — alimentado hoje exclusivamente por TaskRunner
 * (src/core/tasks/TaskRunner.ts).
 *
 * Dependências: nenhuma — apenas o tipo ExecutionRecord definido neste
 * mesmo arquivo.
 *
 * Exemplo de uso:
 * ```ts
 * executionHistory.add({ id, agentId, taskId, provider, status: "SUCCESS", startedAt, finishedAt, durationMs });
 * executionHistory.getAll(); // mais recente primeiro
 * ```
 */
export class ExecutionHistory {
  private records: ExecutionRecord[] = [];

  /** Adiciona um registro ao início do histórico (mais recente primeiro). */
  add(record: ExecutionRecord): void {
    this.records.unshift(record);
  }

  /** Retorna uma cópia rasa de todos os registros, mais recente primeiro. */
  getAll(): ExecutionRecord[] {
    return [...this.records];
  }

  /** Remove todos os registros do histórico. */
  clear(): void {
    this.records = [];
  }

  /** Quantidade total de registros no histórico. */
  count(): number {
    return this.records.length;
  }
}

/** Instância única e compartilhada do ExecutionHistory para toda a plataforma. */
export const executionHistory = new ExecutionHistory();
