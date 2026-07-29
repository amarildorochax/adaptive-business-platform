/**
 * Contrato de execução paralela futura (Tarefa 10 — não implementado
 * nesta Sprint; execução paralela real está explicitamente proibida
 * nesta Sprint). `AgentOrchestrator.execute()` hoje sempre percorre
 * `ExecutionStep[]` sequencialmente, na ordem de `ExecutionStep.order`.
 *
 * Responsabilidade reservada: agrupar `ExecutionStep.order` que
 * poderiam rodar simultaneamente. Nenhum componente desta Sprint cria,
 * lê, ou aplica um ParallelExecutionGroup.
 */
export interface ParallelExecutionGroup {
  planId: string;
  stepOrders: number[];
}
