/**
 * Growth Insight — uma constatação derivada da análise de dado de crescimento; nunca altera estado de
 * outro domínio automaticamente — sua consequência prática é sempre uma Growth Recommendation,
 * sujeita a decisão humana ou a Regra determinística antes de qualquer ação (Blueprint, Capítulo 12).
 * Estrutura definida em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface GrowthInsight {
  /** Identificador do Growth Insight. */
  readonly growthInsightId: string;

  /** Tenant ao qual este Insight pertence. */
  readonly tenantId: string;

  /** Descrição da constatação. */
  readonly description: string;

  /** Momento de identificação. */
  readonly identifiedAt: Date;
}
