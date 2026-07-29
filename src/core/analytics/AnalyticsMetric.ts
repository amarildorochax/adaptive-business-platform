/**
 * Um indicador coletado — a unidade fundamental do Business Analytics
 * (Tarefa 04). `source` é texto livre (ex.: `"crm.customers.count"`,
 * `"finance.snapshot.netProfit"`) — apenas descritivo, nunca resolvido
 * automaticamente por este módulo (ver nota em AnalyticsManager.ts:
 * "Nunca acessar diretamente outros módulos" — quem coleta o valor
 * primeiro consulta a fachada pública do domínio de origem, depois
 * chama `Analytics.collectMetric()`).
 *
 * Não confundir com `AnalyticsMetrics` (`AnalyticsMetrics.ts`, plural)
 * — esta é a entidade de dados coletada; aquela é a classe que mede o
 * uso do próprio módulo Analytics (mesmo padrão de todas as Sprints
 * anteriores).
 */
export interface AnalyticsMetric {
  id: string;

  name: string;

  value: number;

  source: string;

  collectedAt: Date;

  metadata: Record<string, unknown>;
}
