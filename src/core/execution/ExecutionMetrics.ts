/** Retrato agregado do uso do Execution Orchestrator, produzido sob demanda por `ExecutionMetrics.snapshot()`. */
export interface ExecutionMetricsSnapshot {
  requests: number;
  approvals: number;
  cancellations: number;
  queries: number;
  lastUpdatedAt?: Date;
}

/**
 * Métricas de uso do Execution Orchestrator (Tarefa 07) — mesmo padrão
 * já usado por CRMMetrics/CampaignMetrics/.../BusinessIntelligenceMetrics.
 *
 * Dependências: nenhuma.
 */
export class ExecutionMetrics {
  private requests = 0;

  private approvals = 0;

  private cancellations = 0;

  private queries = 0;

  private lastUpdatedAt: Date | undefined;

  /** Registra um ExecutionRequest criado com sucesso. */
  recordRequest(): void {
    this.requests++;
    this.lastUpdatedAt = new Date();
  }

  /** Registra uma aprovação bem-sucedida. */
  recordApproval(): void {
    this.approvals++;
    this.lastUpdatedAt = new Date();
  }

  /** Registra um cancelamento bem-sucedido. */
  recordCancellation(): void {
    this.cancellations++;
    this.lastUpdatedAt = new Date();
  }

  /** Registra uma consulta (getExecution/listExecutions/getMetrics). */
  recordQuery(): void {
    this.queries++;
  }

  /** Monta um retrato agregado das métricas já registradas. */
  snapshot(): ExecutionMetricsSnapshot {
    return {
      requests: this.requests,
      approvals: this.approvals,
      cancellations: this.cancellations,
      queries: this.queries,
      lastUpdatedAt: this.lastUpdatedAt,
    };
  }

  /** Descarta todo o histórico já registrado. */
  clear(): void {
    this.requests = 0;
    this.approvals = 0;
    this.cancellations = 0;
    this.queries = 0;
    this.lastUpdatedAt = undefined;
  }
}
