/**
 * Tool State — o estágio atual de uma Ferramenta dentro de seu ciclo de vida declarativo.
 * Estrutura definida em TOOL_RUNTIME_CONCRETE_STRUCTURE.md.
 */
import type { ToolLifecycleStage } from "./ToolLifecycle.js";

export interface ToolState {
  /** Ferramenta à qual este estado se refere. */
  readonly toolId: string;

  /** Estágio atual do ciclo de vida. */
  readonly stage: ToolLifecycleStage;

  /** Momento em que a Ferramenta entrou neste estágio. */
  readonly enteredAt: Date;
}
