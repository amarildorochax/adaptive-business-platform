/**
 * Contrato futuro (Tarefa 12) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de uma AutomationAction disparando um
 * Agent real (`@/core/catalog`/`@/core/orchestrator`, inalterados) —
 * nenhum Agent é executado nesta Sprint.
 */
export interface AgentExecutionProvider {
  run(agentId: string, taskType: string): Promise<void>;
}
