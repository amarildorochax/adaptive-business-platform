/**
 * Analytics Event — os catorze Eventos de domínio publicados pelo Analytics Hub, cada um relativo à
 * própria operação interna deste Hub (ex.: `DashboardCreated`, `InsightGenerated`) — o Analytics Hub
 * nunca publica um Evento que instrua outro domínio a alterar seu próprio estado
 * (`ANALYTICS_HUB.md`, Capítulo 12).
 * Estrutura definida em `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 10, confirmada em
 * `ANALYTICS_HUB.md`, Capítulo 12 ("o catálogo completo dos catorze Eventos") — sem discrepância de
 * contagem entre os dois documentos.
 */
export type AnalyticsEventType =
  | "DashboardCreated"
  | "DashboardUpdated"
  | "ReportGenerated"
  | "MetricCalculated"
  | "KPIUpdated"
  | "TrendIdentified"
  | "ForecastGenerated"
  | "InsightGenerated"
  | "BenchmarkUpdated"
  | "SnapshotCreated"
  | "DatasetRefreshed"
  | "VisualizationPublished"
  | "RecommendationGenerated"
  | "ScorecardUpdated";

export interface AnalyticsEvent {
  /** Identificador do Evento. */
  readonly eventId: string;

  /** Tipo do Evento. */
  readonly type: AnalyticsEventType;

  /** Momento em que o Fato ocorreu. */
  readonly occurredAt: Date;
}
