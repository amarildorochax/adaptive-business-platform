import type { MarketingRecommendation } from "./MarketingInsights";

/**
 * Contrato futuro (Tarefa 10) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de um executor de ações a partir de
 * uma MarketingRecommendation (ex.: disparar um follow-up automático) —
 * esta Sprint explicitamente não executa campanhas nem envia mensagens.
 */
export interface MarketingAutomation {
  trigger(recommendation: MarketingRecommendation): Promise<void>;
}
