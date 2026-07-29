/**
 * Executive Indicator — um indicador voltado à leitura de alta liderança, tipicamente mais
 * consolidado.
 * Estrutura definida em `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface ExecutiveIndicator {
  /** Identificador do Executive Indicator. */
  readonly executiveIndicatorId: string;

  /** Tenant ao qual este indicador pertence. */
  readonly tenantId: string;

  /** Metric à qual este indicador se refere. */
  readonly metricId: string;
}
