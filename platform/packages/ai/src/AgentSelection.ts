/**
 * Agent Selection — o registro de que um Agente foi selecionado para uma subtarefa específica, com
 * base em sua especialização declarada, nunca uma delegação forçada a especialização incompatível.
 * Estrutura definida em ORCHESTRATOR_CONCRETE_STRUCTURE.md.
 */
export interface AgentSelection {
  /** Subtarefa para a qual esta seleção foi feita. */
  readonly subtaskId: string;

  /** Agente selecionado — identificador opaco, sem redefinir Agent Contract (Component 18). */
  readonly agentId: string;

  /** Momento da seleção. */
  readonly selectedAt: Date;
}
