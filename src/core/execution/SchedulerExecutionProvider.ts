/**
 * Contrato futuro (Tarefa 09) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de um agendamento automático de
 * ExecutionRequest (produzindo o estado `"scheduled"`, reservado desde
 * ExecutionStatus.ts) — hoje nenhum agendamento existe.
 */
export interface SchedulerExecutionProvider {
  schedule(requestId: string, at: Date): Promise<void>;
}
