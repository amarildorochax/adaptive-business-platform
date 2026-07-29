/**
 * Contrato futuro (Tarefa 15) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de uma notificação disparada a partir
 * de um evento de CRM (ex.: nova Opportunity criada) — nenhuma
 * integração externa é feita nesta Sprint.
 */
export interface CRMNotificationProvider {
  notify(customerId: string, message: string): Promise<void>;
}
