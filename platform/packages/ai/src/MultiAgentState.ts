/**
 * Multi-Agent State — o estágio atual de um grupo dentro de seu ciclo de vida declarativo.
 * Estrutura definida em MULTI_AGENT_CONCRETE_STRUCTURE.md.
 */
import type { MultiAgentLifecycleStage } from "./MultiAgentLifecycle.js";

export interface MultiAgentState {
  /** Grupo ao qual este estado se refere. */
  readonly groupId: string;

  /** Estágio atual do ciclo de vida. */
  readonly stage: MultiAgentLifecycleStage;

  /** Momento em que o grupo entrou neste estágio. */
  readonly enteredAt: Date;
}
