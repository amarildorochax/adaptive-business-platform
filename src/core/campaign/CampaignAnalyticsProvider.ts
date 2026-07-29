import type { CampaignResult } from "./CampaignResult";

/**
 * Contrato futuro (Tarefa 12) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de uma coleta real de métricas de
 * campanha (entregas/aberturas/cliques/conversões/receita) que
 * futuramente chamaria `Campaign.recordResult()` — hoje nenhum
 * CampaignResult é produzido automaticamente (ver nota em
 * CampaignResult.ts).
 */
export interface CampaignAnalyticsProvider {
  collect(campaignId: string): Promise<CampaignResult>;
}
