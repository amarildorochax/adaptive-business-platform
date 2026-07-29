/** Registro de uma única orquestração já concluída, sucesso ou falha. */
export interface OrchestratorExecutionRecord {
  durationMs: number;
  stepCount: number;
  agentIds: string[];
  failed: boolean;
}

/** Retrato agregado do uso do Agent Orchestrator, produzido sob demanda por `OrchestratorMetrics.snapshot()`. */
export interface OrchestratorMetricsSnapshot {
  executions: number;
  averageDurationMs: number;
  agentsUsed: Record<string, number>;
  stepsExecuted: number;
  failures: number;
}

/**
 * Métricas de uso do Agent Orchestrator (Tarefa 08) — mesmo padrão já
 * usado por AIMetrics/MemoryMetrics/PromptMetrics.
 *
 * Responsabilidade: registrar cada orquestração concluída — duração,
 * quantidade de etapas, quais Agents foram usados, e se houve falha —
 * e agregar sob demanda.
 *
 * Dependências: nenhuma.
 */
export class OrchestratorMetrics {
  private records: OrchestratorExecutionRecord[] = [];

  /** Registra a conclusão de uma orquestração (sucesso ou falha). */
  recordExecution(record: OrchestratorExecutionRecord): void {
    this.records.push(record);
  }

  /** Monta um retrato agregado das métricas já registradas. */
  snapshot(): OrchestratorMetricsSnapshot {
    const executions = this.records.length;

    const averageDurationMs =
      executions === 0
        ? 0
        : this.records.reduce((sum, record) => sum + record.durationMs, 0) / executions;

    const agentsUsed: Record<string, number> = {};
    let stepsExecuted = 0;
    let failures = 0;

    for (const record of this.records) {
      stepsExecuted += record.stepCount;

      if (record.failed) {
        failures++;
      }

      for (const agentId of record.agentIds) {
        agentsUsed[agentId] = (agentsUsed[agentId] ?? 0) + 1;
      }
    }

    return { executions, averageDurationMs, agentsUsed, stepsExecuted, failures };
  }

  /** Descarta todo o histórico já registrado. */
  clear(): void {
    this.records = [];
  }
}
