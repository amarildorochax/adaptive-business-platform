/**
 * Report — o documento estruturado de leitura analítica gerado a partir de um Report Template já
 * definido, consumindo Dataset e Visualization já consolidados.
 * Estrutura definida em `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Report {
  /** Identificador do Report. */
  readonly reportId: string;

  /** Tenant ao qual o Report pertence. */
  readonly tenantId: string;

  /** Report Template a partir do qual este Report foi gerado. */
  readonly reportTemplateId: string;

  /** Momento de geração. */
  readonly generatedAt: Date;

  /** Título legível, herdado de `src/core/analytics/AnalyticsReport.ts` (Business Analytics legado). */
  readonly title?: string;

  /**
   * Resumo determinístico (contagem/média/mínimo/máximo sobre as Metric associadas) — nunca gerado
   * por IA, mesmo princípio já explícito no doc-comment de `AnalyticsReport.ts`/
   * `AnalyticsService.buildSummary()` (legado) e na exclusão de IA desta própria Sprint.
   */
  readonly summary?: string;
}
