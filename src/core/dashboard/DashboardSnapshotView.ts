/** Um AnalyticsMetric já achatado para apresentação — apenas os três campos relevantes para exibição. */
export interface DashboardSnapshotMetricView {
  name: string;
  value: number;
  source: string;
}

/**
 * Dados de uma AnalyticsSnapshot já preparados para apresentação
 * (Tarefa 05) — uma reformatação direta, nunca uma nova análise
 * (REGRA: "nenhuma lógica analítica deverá existir no Dashboard").
 *
 * Produzido exclusivamente por `DashboardAnalyticsProvider.
 * toSnapshotView()`, a partir de uma `AnalyticsSnapshot` já calculada
 * por `@/core/analytics` — nenhum campo aqui é computado, apenas
 * copiado/reorganizado.
 */
export interface DashboardSnapshotView {
  snapshotId: string;

  generatedAt: Date;

  metricsCount: number;

  metrics: DashboardSnapshotMetricView[];
}
