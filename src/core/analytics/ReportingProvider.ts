/**
 * Contrato futuro (Tarefa 11) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de uma geração de relatório mais
 * sofisticada (ex.: texto gerado por IA) — `AnalyticsService.
 * buildSummary()` nesta Sprint é sempre determinístico, sem IA.
 */
export interface ReportingProvider {
  generate(snapshotId: string): Promise<string>;
}
