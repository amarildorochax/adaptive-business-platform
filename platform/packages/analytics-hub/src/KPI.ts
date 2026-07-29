/**
 * KPI — o indicador-chave derivado de uma ou mais Metric; sempre calculado, nunca definido como
 * valor arbitrário (KPIs Are Derived, Blueprint ADR-003).
 * Estrutura definida em `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface KPI {
  /** Identificador do KPI. */
  readonly kpiId: string;

  /** Tenant ao qual o KPI pertence. */
  readonly tenantId: string;

  /** Metrics das quais este KPI é derivado — nunca um valor arbitrário. */
  readonly metricIds: readonly string[];

  /** Valor derivado. */
  readonly value: number;

  /** Momento do último recálculo. */
  readonly calculatedAt: Date;
}
