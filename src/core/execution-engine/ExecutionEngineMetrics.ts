/**
 * Retrato agregado do uso do Execution Engine, produzido sob demanda
 * por `snapshot()`. Une os campos pedidos pela Tarefa 08 (`runs`/
 * `completed`/`cancelled`/`failed`/`queries`/`lastUpdatedAt`) e pela
 * Tarefa 13, mais detalhada (`totalRuns`/`activeRuns`/`completedRuns`/
 * `cancelledRuns`/`failedRuns`/`totalSteps`/`lastUpdatedAt`) — nenhum
 * campo pedido por nenhuma das duas foi descartado.
 */
export interface ExecutionEngineMetricsSnapshot {
  totalRuns: number;
  activeRuns: number;
  completedRuns: number;
  cancelledRuns: number;
  failedRuns: number;
  totalSteps: number;
  queries: number;
  lastUpdatedAt?: Date;
}

/**
 * Métricas de uso do Execution Engine (Tarefas 08/13) — mesmo padrão já
 * usado por CRMMetrics/CampaignMetrics/.../ExecutionSchedulingMetrics.
 *
 * `activeRuns` é sempre calculado no momento de `snapshot()`, a partir
 * da contagem de ExecutionRun com `status === "running"` informada
 * pelo chamador (mesmo princípio já usado por
 * `CRMMetrics.snapshot(counts)`) — nunca armazenado internamente, já
 * que "ativo" é sempre um estado presente, não um total acumulado.
 *
 * Dependências: nenhuma.
 */
export class ExecutionEngineMetrics {
  private totalRuns = 0;

  private completedRuns = 0;

  private cancelledRuns = 0;

  private failedRuns = 0;

  private totalSteps = 0;

  private queries = 0;

  private lastUpdatedAt: Date | undefined;

  /** Registra o início de um ExecutionRun (`beginRun()` bem-sucedido). */
  recordRunStarted(): void {
    this.totalRuns++;
    this.lastUpdatedAt = new Date();
  }

  /** Registra a conclusão de um ExecutionRun, somando `stepsCount` ao total de etapas. */
  recordCompleted(stepsCount: number): void {
    this.completedRuns++;
    this.totalSteps += stepsCount;
    this.lastUpdatedAt = new Date();
  }

  /** Registra o cancelamento de um ExecutionRun. */
  recordCancelled(): void {
    this.cancelledRuns++;
    this.lastUpdatedAt = new Date();
  }

  /** Registra a falha de um ExecutionRun (caminho estrutural, não alcançado nesta Sprint). */
  recordFailed(): void {
    this.failedRuns++;
    this.lastUpdatedAt = new Date();
  }

  /** Registra uma consulta (getExecutionRun/listExecutionRuns/getMetrics). */
  recordQuery(): void {
    this.queries++;
  }

  /** Monta um retrato agregado das métricas já registradas. `activeRuns` é informado pelo chamador. */
  snapshot(activeRuns: number): ExecutionEngineMetricsSnapshot {
    return {
      totalRuns: this.totalRuns,
      activeRuns,
      completedRuns: this.completedRuns,
      cancelledRuns: this.cancelledRuns,
      failedRuns: this.failedRuns,
      totalSteps: this.totalSteps,
      queries: this.queries,
      lastUpdatedAt: this.lastUpdatedAt,
    };
  }

  /** Descarta todo o histórico já registrado. */
  clear(): void {
    this.totalRuns = 0;
    this.completedRuns = 0;
    this.cancelledRuns = 0;
    this.failedRuns = 0;
    this.totalSteps = 0;
    this.queries = 0;
    this.lastUpdatedAt = undefined;
  }
}
