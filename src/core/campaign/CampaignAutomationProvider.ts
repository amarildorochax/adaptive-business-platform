/**
 * Contrato futuro (Tarefa 12) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de uma automação disparada a partir
 * de um evento de Campaign (ex.: `CAMPAIGN_FINISHED` acionando um
 * follow-up) — nenhuma automação é executada nesta Sprint.
 */
export interface CampaignAutomationProvider {
  trigger(campaignId: string, event: string): Promise<void>;
}
