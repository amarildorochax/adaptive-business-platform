/**
 * Visualization — a representação gráfica de uma Metric, de um KPI ou de um Trend.
 * Estrutura definida em `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Visualization {
  /** Identificador da Visualization. */
  readonly visualizationId: string;

  /** Identificador opaco da Metric, KPI, ou Trend representado. */
  readonly sourceId: string;

  /** Momento em que esta Visualization se tornou disponível. */
  readonly publishedAt: Date;
}
