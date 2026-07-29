/**
 * Operational Indicator — um indicador voltado ao acompanhamento do dia a dia operacional.
 * Estrutura definida em `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface OperationalIndicator {
  /** Identificador do Operational Indicator. */
  readonly operationalIndicatorId: string;

  /** Tenant ao qual este indicador pertence. */
  readonly tenantId: string;

  /** Metric à qual este indicador se refere. */
  readonly metricId: string;
}
