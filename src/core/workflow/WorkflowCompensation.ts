/**
 * Contrato de compensação (rollback) futuro (Tarefa 11 — não
 * implementado nesta Sprint). Quando `WorkflowExecutor` encontra uma
 * falha hoje, apenas marca o WorkflowPlan como `FAILED` e para — nenhuma
 * etapa já concluída é desfeita.
 *
 * Responsabilidade reservada: declarar, por etapa, uma ação de
 * compensação a executar caso uma etapa posterior do mesmo workflow
 * falhe. Nenhum componente desta Sprint cria, lê, ou executa uma
 * WorkflowCompensationAction.
 */
export interface WorkflowCompensationAction {
  stepOrder: number;

  /** Descrição da ação de compensação — nunca executada nesta Sprint. */
  action: string;
}
