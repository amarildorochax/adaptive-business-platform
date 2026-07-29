/**
 * Growth KPI — um indicador-chave de crescimento, derivado de uma ou mais Growth Metric.
 * Estrutura definida em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface GrowthKPI {
  /** Identificador do Growth KPI. */
  readonly growthKPIId: string;

  /** Tenant ao qual este KPI pertence. */
  readonly tenantId: string;

  /** Growth Metrics das quais este KPI é derivado. */
  readonly growthMetricIds: readonly string[];

  /** Valor derivado. */
  readonly value: number;
}
