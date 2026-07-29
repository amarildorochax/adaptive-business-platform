/**
 * Time Series — a sequência ordenada de Snapshot de uma mesma Metric ao longo do tempo, insumo
 * direto da identificação de um Trend.
 * Estrutura definida em `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 4.
 */
export interface TimeSeries {
  /** Identificador da Time Series. */
  readonly timeSeriesId: string;

  /** Metric à qual esta Time Series se refere. */
  readonly metricId: string;

  /** Snapshots que compõem esta Time Series, em ordem cronológica. */
  readonly snapshotIds: readonly string[];
}
