/** Prioridade de uma Recommendation — derivada da `severity` do Insight que a originou. */
export type RecommendationPriority = "low" | "medium" | "high";

/**
 * Recomendação estruturada derivada de um Insight já existente (Tarefa
 * 05) — nunca texto livre gerado por IA (fora do escopo desta Sprint).
 */
export interface Recommendation {
  id: string;

  insightId: string;

  title: string;

  description: string;

  priority: RecommendationPriority;

  createdAt: Date;
}
