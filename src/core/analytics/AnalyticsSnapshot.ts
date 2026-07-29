import type { AnalyticsMetric } from "./AnalyticsMetric";

/**
 * Retrato consolidado de todas as AnalyticsMetric já coletadas no
 * momento em que foi criado (Tarefa 05) — `AnalyticsService.
 * createSnapshot()` nunca filtra ou limpa métricas; cada snapshot é uma
 * fotografia cumulativa e independente das anteriores.
 */
export interface AnalyticsSnapshot {
  id: string;

  generatedAt: Date;

  metrics: AnalyticsMetric[];

  metadata: Record<string, unknown>;
}
