/**
 * Analytics Query — as treze Consultas de leitura do Analytics Hub, cada uma resolvida contra um
 * Read Model já materializado, ainda que reconstruível a partir do histórico completo de Evento
 * (Event Replay).
 * Estrutura definida em `ANALYTICS_HUB.md`, Capítulo 11.
 */
export type AnalyticsQueryType =
  | "DashboardView"
  | "ExecutiveDashboard"
  | "ReportView"
  | "KPIView"
  | "MetricView"
  | "DatasetView"
  | "TrendView"
  | "TimeSeriesView"
  | "AnalyticsTimeline"
  | "ForecastView"
  | "InsightView"
  | "DecisionSupportView"
  | "BenchmarkView";

export interface AnalyticsQuery {
  /** Identificador da Query. */
  readonly queryId: string;

  /** Tipo da Query. */
  readonly type: AnalyticsQueryType;

  /** Momento em que a Query foi solicitada. */
  readonly requestedAt: Date;
}
