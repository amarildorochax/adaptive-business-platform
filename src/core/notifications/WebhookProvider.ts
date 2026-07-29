/**
 * Contrato futuro (Tarefa 12) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de um provedor real de disparo de
 * webhook — nenhum webhook é chamado nesta Sprint.
 */
export interface WebhookProvider {
  send(url: string, payload: Record<string, unknown>): Promise<void>;
}
