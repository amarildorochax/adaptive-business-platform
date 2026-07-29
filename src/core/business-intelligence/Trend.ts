/** Sentido de um Trend. */
export type TrendDirection = "up" | "down" | "stable";

/**
 * Tendência detectada em um AnalyticsMetric ao longo de uma única
 * AnalyticsSnapshot (Tarefa 06) — compara a primeira e a última
 * ocorrência de `AnalyticsMetric.name` dentro dos `metrics` de uma
 * mesma snapshot (ver `BusinessIntelligenceService.detectTrends()`).
 * Detecção simples e determinística — nunca séries temporais entre
 * múltiplas snapshots, nunca estatística avançada (fora do escopo desta
 * Sprint).
 *
 * `confidence` é um número entre 0 e 1 — a variação relativa entre a
 * primeira e a última ocorrência, limitada a 1; não é uma probabilidade
 * estatística formal.
 */
export interface Trend {
  id: string;

  metricName: string;

  direction: TrendDirection;

  confidence: number;

  detectedAt: Date;
}
