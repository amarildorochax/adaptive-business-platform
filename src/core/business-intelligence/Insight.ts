/** Gravidade de um Insight — derivada da confiança do Trend que o originou (ver `BusinessIntelligenceService.classifySeverity()`). */
export type InsightSeverity = "low" | "medium" | "high";

/**
 * Interpretação estruturada de uma tendência observada em um
 * AnalyticsReport (Tarefa 04) — nunca texto livre gerado por IA (fora
 * do escopo desta Sprint). `metadata` guarda a rastreabilidade até a
 * origem (`reportId`/`snapshotId`/`trendId`) — não modelada como campo
 * próprio, já que a Tarefa 04 não pediu isso.
 */
export interface Insight {
  id: string;

  title: string;

  description: string;

  severity: InsightSeverity;

  createdAt: Date;

  metadata: Record<string, unknown>;
}
