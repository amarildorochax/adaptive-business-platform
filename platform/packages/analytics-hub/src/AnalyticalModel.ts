/**
 * Analytical Model — a estrutura lógica que define como um conjunto de dado é transformado em
 * Metric ou em Insight, mantida determinística e auditável.
 * Estrutura definida em `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface AnalyticalModel {
  /** Identificador do Analytical Model. */
  readonly analyticalModelId: string;

  /** Tenant ao qual este modelo pertence. */
  readonly tenantId: string;

  /** Descrição da transformação lógica aplicada. */
  readonly description: string;
}
