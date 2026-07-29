/**
 * Contrato de workflow condicional futuro (Tarefa 11 — não implementado
 * nesta Sprint). `WorkflowPlanner` hoje sempre inclui todas as etapas
 * da definição, sem avaliar nenhuma condição.
 *
 * Responsabilidade reservada: decidir se uma etapa deve rodar, com base
 * em `WorkflowContext` já acumulado até aquele ponto. Nenhum componente
 * desta Sprint cria, lê, ou avalia uma WorkflowCondition.
 */
export interface WorkflowCondition {
  stepOrder: number;

  /** Nome de uma chave já registrada em WorkflowContext, cujo valor decidiria se a etapa roda. */
  dependsOnContextKey: string;
}
