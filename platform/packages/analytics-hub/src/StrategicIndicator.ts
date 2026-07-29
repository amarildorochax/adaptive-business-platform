/**
 * Strategic Indicator — um indicador voltado à leitura de médio e longo prazo de posicionamento
 * estratégico.
 * Estrutura definida em `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface StrategicIndicator {
  /** Identificador do Strategic Indicator. */
  readonly strategicIndicatorId: string;

  /** Tenant ao qual este indicador pertence. */
  readonly tenantId: string;

  /** Metric à qual este indicador se refere. */
  readonly metricId: string;
}
