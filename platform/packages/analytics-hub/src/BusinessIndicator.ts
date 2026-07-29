/**
 * Business Indicator — um indicador de leitura geral do desempenho de negócio.
 * Estrutura definida em `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface BusinessIndicator {
  /** Identificador do Business Indicator. */
  readonly businessIndicatorId: string;

  /** Tenant ao qual este indicador pertence. */
  readonly tenantId: string;

  /** Metric à qual este indicador se refere. */
  readonly metricId: string;
}
