/**
 * Growth Metric — uma medida quantitativa isolada de crescimento.
 * Estrutura definida em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface GrowthMetric {
  /** Identificador da Growth Metric. */
  readonly growthMetricId: string;

  /** Tenant ao qual esta Metric pertence. */
  readonly tenantId: string;

  /** Valor calculado. */
  readonly value: number;

  /** Momento do último cálculo. */
  readonly calculatedAt: Date;
}
