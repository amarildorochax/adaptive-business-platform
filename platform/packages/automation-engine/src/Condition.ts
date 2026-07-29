/**
 * Condition — a expressão lógica atômica avaliada para determinar se a execução de um Workflow deve
 * prosseguir, uma das sete categorias já catalogadas em `AUTOMATION_ENGINE.md`, Capítulo 10.
 * "Segmentos" e "Perfil" consultam o Business Profile Engine, e "Permissões" consulta o Identity Hub
 * — ambos referenciados apenas através de `description`, opaca, nunca por import de
 * `@abp/platform-services` ou de qualquer outro pacote. "Estado do Workflow" consulta o progresso de
 * uma execução em andamento, cujo modelo completo (Execution) pertence à Sprint 6.3 — referenciado
 * aqui apenas de forma descritiva, nunca antecipado.
 * Estrutura definida em `AUTOMATION_ENGINE.md`, Capítulo 10.
 */
export type ConditionKind =
  | "Filter"
  | "Date"
  | "Value"
  | "Segment"
  | "Profile"
  | "Permission"
  | "WorkflowState";

export interface Condition {
  /** Identificador da Condition. */
  readonly conditionId: string;

  /** Categoria da Condition. */
  readonly kind: ConditionKind;

  /** Descrição opaca da comparação específica — nunca um tipo importado de outro pacote. */
  readonly description: string;
}
