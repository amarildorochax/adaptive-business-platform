/**
 * Engagement Score — uma medida derivada do nível de engajamento observado de um Cliente ao longo do
 * tempo; sempre calculado a partir de sinal de comportamento observado, nunca definido manualmente
 * como valor arbitrário (Blueprint, ADR-011).
 * Estrutura definida em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface EngagementScore {
  /** Referência opaca ao Cliente ou ao Cohort — nunca uma cópia de Customer do CRM Hub. */
  readonly subjectReferenceId: string;

  /** Valor calculado. */
  readonly value: number;

  /** Momento do último cálculo. */
  readonly calculatedAt: Date;
}
