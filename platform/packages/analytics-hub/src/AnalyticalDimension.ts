/**
 * Analytical Dimension — o eixo de categorização usado para segmentar uma Metric (ex.: por período,
 * por canal, por Segmento).
 * Estrutura definida em `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 4.
 */
export interface AnalyticalDimension {
  /** Identificador da Analytical Dimension. */
  readonly analyticalDimensionId: string;

  /** Nome do eixo de categorização. */
  readonly name: string;
}
