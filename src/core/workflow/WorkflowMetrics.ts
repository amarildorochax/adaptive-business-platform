/** Registro de uma única execução de workflow já concluída, sucesso ou falha. */
export interface WorkflowExecutionRecord {
  workflowId: string;
  durationMs: number;
  stepCount: number;
  failed: boolean;
}

/** Retrato agregado do uso do Workflow Engine, produzido sob demanda por `WorkflowMetrics.snapshot()`. */
export interface WorkflowMetricsSnapshot {
  workflowsExecuted: number;
  averageDurationMs: number;
  stepsExecuted: number;
  failures: number;
  workflowsByType: Record<string, number>;
}

/**
 * Métricas de uso do Workflow Engine (Tarefa 09) — mesmo padrão já
 * usado por AIMetrics/MemoryMetrics/PromptMetrics/OrchestratorMetrics.
 *
 * Responsabilidade: registrar cada execução de workflow concluída —
 * duração, quantidade de etapas, e se houve falha — e agregar sob
 * demanda, incluindo a contagem por `workflowId` (definição de
 * origem).
 *
 * Dependências: nenhuma.
 */
export class WorkflowMetrics {
  private records: WorkflowExecutionRecord[] = [];

  /** Registra a conclusão de uma execução de workflow (sucesso ou falha). */
  recordExecution(record: WorkflowExecutionRecord): void {
    this.records.push(record);
  }

  /** Monta um retrato agregado das métricas já registradas. */
  snapshot(): WorkflowMetricsSnapshot {
    const workflowsExecuted = this.records.length;

    const averageDurationMs =
      workflowsExecuted === 0
        ? 0
        : this.records.reduce((sum, record) => sum + record.durationMs, 0) / workflowsExecuted;

    const workflowsByType: Record<string, number> = {};
    let stepsExecuted = 0;
    let failures = 0;

    for (const record of this.records) {
      stepsExecuted += record.stepCount;

      if (record.failed) {
        failures++;
      }

      workflowsByType[record.workflowId] = (workflowsByType[record.workflowId] ?? 0) + 1;
    }

    return { workflowsExecuted, averageDurationMs, stepsExecuted, failures, workflowsByType };
  }

  /** Descarta todo o histórico já registrado. */
  clear(): void {
    this.records = [];
  }
}
