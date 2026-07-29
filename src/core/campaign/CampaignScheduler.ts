/**
 * Contrato futuro (Tarefa 12) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de um agendamento automático de
 * início/encerramento de CampaignRecord — hoje `startCampaign()`/
 * `finishCampaign()` só ocorrem por chamada explícita.
 */
export interface CampaignScheduler {
  schedule(campaignId: string, at: Date): Promise<void>;
}
