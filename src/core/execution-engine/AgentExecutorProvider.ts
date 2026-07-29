/**
 * Contrato futuro (Tarefa 10) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de um ExecutionStep disparando um
 * Agent real (`@/core/catalog`/`@/core/orchestrator`, inalterados) —
 * hoje nenhum Agent é executado.
 */
export interface AgentExecutorProvider {
  run(stepId: string, agentId: string): Promise<void>;
}
