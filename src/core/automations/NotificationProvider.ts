/**
 * Contrato futuro (Tarefa 12) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de uma AutomationAction disparando
 * uma notificação — nenhuma notificação é enviada nesta Sprint.
 */
export interface NotificationProvider {
  notify(target: string, message: string): Promise<void>;
}
