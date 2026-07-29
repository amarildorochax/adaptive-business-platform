/**
 * Insight — uma constatação derivada da análise consolidada de dado analítico; nunca executa ação
 * por si só — sua consequência prática é sempre uma Analytical Recommendation (Insights Never
 * Execute, Blueprint ADR-005).
 * Estrutura definida em `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Insight {
  /** Identificador do Insight. */
  readonly insightId: string;

  /** Tenant ao qual o Insight pertence. */
  readonly tenantId: string;

  /** Dataset a partir do qual este Insight foi identificado. */
  readonly datasetId: string;

  /** Descrição da constatação. */
  readonly description: string;

  /** Momento de identificação. */
  readonly identifiedAt: Date;
}
