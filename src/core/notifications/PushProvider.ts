/**
 * Contrato futuro (Tarefa 12) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de um provedor real de push
 * notification — nenhum push é enviado nesta Sprint.
 */
export interface PushProvider {
  send(deviceToken: string, title: string, body: string): Promise<void>;
}
