/** Retrato agregado do uso do Execution Scheduling, produzido sob demanda por `snapshot()`. */
export interface ExecutionSchedulingMetricsSnapshot {
  schedules: number;
  approvals: number;
  rejections: number;
  queries: number;
  lastUpdatedAt?: Date;
}

/**
 * Métricas de uso do Execution Scheduling (Tarefa 06) — mesmo padrão já
 * usado por CRMMetrics/CampaignMetrics/.../ExecutionMetrics.
 *
 * Dependências: nenhuma.
 */
export class ExecutionSchedulingMetrics {
  private schedules = 0;

  private approvals = 0;

  private rejections = 0;

  private queries = 0;

  private lastUpdatedAt: Date | undefined;

  /** Registra um ExecutionSchedule criado com sucesso. */
  recordSchedule(): void {
    this.schedules++;
    this.lastUpdatedAt = new Date();
  }

  /** Registra uma aprovação bem-sucedida. */
  recordApproval(): void {
    this.approvals++;
    this.lastUpdatedAt = new Date();
  }

  /** Registra uma rejeição bem-sucedida. */
  recordRejection(): void {
    this.rejections++;
    this.lastUpdatedAt = new Date();
  }

  /** Registra uma consulta (getSchedule/listSchedules/getMetrics). */
  recordQuery(): void {
    this.queries++;
  }

  /** Monta um retrato agregado das métricas já registradas. */
  snapshot(): ExecutionSchedulingMetricsSnapshot {
    return {
      schedules: this.schedules,
      approvals: this.approvals,
      rejections: this.rejections,
      queries: this.queries,
      lastUpdatedAt: this.lastUpdatedAt,
    };
  }

  /** Descarta todo o histórico já registrado. */
  clear(): void {
    this.schedules = 0;
    this.approvals = 0;
    this.rejections = 0;
    this.queries = 0;
    this.lastUpdatedAt = undefined;
  }
}
