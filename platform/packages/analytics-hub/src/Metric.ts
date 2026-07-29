/**
 * Metric — a medida quantitativa isolada, unidade básica de toda leitura analítica; toda Metric
 * exposta possui fórmula e janela temporal explicitamente identificáveis, nenhuma exposta sem que
 * sua origem e seu período de referência sejam claros (Blueprint, ADR-012).
 * Estrutura definida em `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Metric {
  /** Identificador da Metric. */
  readonly metricId: string;

  /** Tenant ao qual a Metric pertence. */
  readonly tenantId: string;

  /** Dataset a partir do qual esta Metric é calculada. */
  readonly datasetId: string;

  /** Fórmula de cálculo, explícita e auditável. */
  readonly formula: string;

  /** Janela temporal de referência. */
  readonly windowStart: Date;

  /** Fim da janela temporal de referência. */
  readonly windowEnd: Date;

  /** Valor calculado. */
  readonly value: number;

  /** Momento do último cálculo. */
  readonly calculatedAt: Date;
}
