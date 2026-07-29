/**
 * Relatório gerado a partir de uma AnalyticsSnapshot já existente
 * (Tarefa 06). `summary` é sempre um texto determinístico, calculado
 * por agregação simples (contagem/média/mínimo/máximo) sobre
 * `AnalyticsSnapshot.metrics` — nunca gerado por IA (fora do escopo
 * desta Sprint; ver `AnalyticsService.buildSummary()`).
 */
export interface AnalyticsReport {
  id: string;

  title: string;

  generatedAt: Date;

  snapshotId: string;

  summary: string;

  metadata: Record<string, unknown>;
}
