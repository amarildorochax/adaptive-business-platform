/**
 * Context Lifecycle State — as treze etapas do ciclo de vida de um Contexto, das quais nenhuma é
 * pulada, mesmo quando resolvida automaticamente sem intervenção adicional.
 * Estrutura definida em CONTEXT_CONCRETE_STRUCTURE.md.
 */
export type ContextLifecycleStage =
  | "Create"
  | "Collect"
  | "Normalize"
  | "Validate"
  | "Score"
  | "Prioritize"
  | "Compress"
  | "Distribute"
  | "Consume"
  | "Observe"
  | "Update"
  | "Expire"
  | "Archive";

export interface ContextLifecycleState {
  /** Contexto ao qual este estado se refere. */
  readonly contextId: string;

  /** Estágio atual do ciclo de vida. */
  readonly stage: ContextLifecycleStage;

  /** Momento em que o Contexto entrou neste estágio. */
  readonly enteredAt: Date;
}
