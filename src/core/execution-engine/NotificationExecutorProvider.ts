/**
 * Contrato futuro (Tarefa 10) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de um ExecutionStep disparando uma
 * notificação real (`@/core/notifications`, inalterado) — hoje nenhuma
 * notificação é enviada.
 */
export interface NotificationExecutorProvider {
  run(stepId: string): Promise<void>;
}
