/**
 * Contrato futuro (Tarefa 12) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de um executor real de campanhas —
 * esta Sprint explicitamente nunca executa campanhas (`Campaign.
 * startCampaign()` apenas registra o início, não dispara nada).
 */
export interface CampaignExecutionProvider {
  execute(campaignId: string): Promise<void>;
}
