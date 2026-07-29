/** Retrato agregado do uso do Business Analytics, produzido sob demanda por `AnalyticsMetrics.snapshot()`. */
export interface AnalyticsMetricsSnapshot {
  reports: number;
  snapshots: number;
  metrics: number;
  queries: number;
  lastUpdatedAt?: Date;
}

/**
 * Métricas de uso do Business Analytics (Tarefa 09) — mesmo padrão já
 * usado por CRMMetrics/CampaignMetrics/FinanceMetrics/
 * AutomationMetrics/NotificationMetrics.
 *
 * Não confundir com `AnalyticsMetric` (`AnalyticsMetric.ts`, singular)
 * — aquela é a entidade de dados coletada; esta classe mede o uso do
 * próprio módulo Analytics (quantos reports/snapshots/métricas,
 * quantas consultas).
 *
 * `reports`/`snapshots`/`metrics` (totais atuais) são informados pelo
 * chamador em `snapshot()` — mesmo princípio já usado por
 * `CRMMetrics.snapshot(counts)` — para que esta classe não precise
 * depender de AnalyticsStore.
 *
 * Dependências: nenhuma.
 */
export class AnalyticsMetrics {
  private queries = 0;

  private lastUpdatedAt: Date | undefined;

  /** Marca uma mutação (collectMetric/createSnapshot/createReport) já concluída. */
  recordMutation(): void {
    this.lastUpdatedAt = new Date();
  }

  /** Registra uma consulta (listReports/getSnapshot/getMetrics). */
  recordQuery(): void {
    this.queries++;
  }

  /** Monta um retrato agregado das métricas já registradas. */
  snapshot(counts: { reports: number; snapshots: number; metrics: number }): AnalyticsMetricsSnapshot {
    return {
      reports: counts.reports,
      snapshots: counts.snapshots,
      metrics: counts.metrics,
      queries: this.queries,
      lastUpdatedAt: this.lastUpdatedAt,
    };
  }

  /** Descarta todo o histórico já registrado. */
  clear(): void {
    this.queries = 0;
    this.lastUpdatedAt = undefined;
  }
}
