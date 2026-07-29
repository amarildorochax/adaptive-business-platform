/**
 * Contrato futuro (Tarefa 12) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de um canal de envio (e-mail,
 * WhatsApp, redes sociais) para uma CampaignRecord — nenhum envio de
 * mensagem é feito nesta Sprint.
 */
export interface CampaignChannelProvider {
  send(campaignId: string, customerId: string): Promise<void>;
}
