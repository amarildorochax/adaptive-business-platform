/**
 * Aggregation — a operação de consolidação de múltiplos dados brutos de um Dataset em uma medida
 * única, insumo direto do cálculo de Metric.
 * Estrutura definida em `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Aggregation {
  /** Identificador da Aggregation. */
  readonly aggregationId: string;

  /** Dataset consolidado por esta Aggregation. */
  readonly datasetId: string;

  /** Momento de processamento. */
  readonly processedAt: Date;
}
