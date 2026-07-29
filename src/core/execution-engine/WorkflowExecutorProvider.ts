/**
 * Contrato futuro (Tarefa 10) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de um ExecutionStep disparando um
 * Workflow real (`@/core/workflow`, inalterado) — hoje nenhum Workflow
 * é executado.
 */
export interface WorkflowExecutorProvider {
  run(stepId: string): Promise<void>;
}
