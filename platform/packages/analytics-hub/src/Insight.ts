/**
 * Gravidade de um Insight. Tipo fechado herdado de `src/core/business-intelligence/Insight.ts`
 * (Business Intelligence Engine legado, real e funcional) — derivada do grau de confiança do Trend
 * que originou o Insight.
 */
export type InsightSeverity = 'low' | 'medium' | 'high';

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

  /** Título legível, herdado de `src/core/business-intelligence/Insight.ts`. */
  readonly title?: string;

  /** Gravidade, herdada de `src/core/business-intelligence/Insight.ts`. */
  readonly severity?: InsightSeverity;
}
