/**
 * Contrato de workflows paralelos futuro (Tarefa 11 — não implementado
 * nesta Sprint). `WorkflowExecutor` hoje sempre percorre `WorkflowStep[]`
 * sequencialmente.
 *
 * Responsabilidade reservada: agrupar `WorkflowStep.order` que poderiam
 * rodar simultaneamente. Nenhum componente desta Sprint cria, lê, ou
 * aplica um ParallelWorkflowGroup.
 */
export interface ParallelWorkflowGroup {
  planId: string;
  stepOrders: number[];
}
