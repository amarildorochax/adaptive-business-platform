/**
 * Agent Lifecycle State — os nove estágios do ciclo de vida de um Agente, da Criação à Aposentadoria.
 * Desativação é sempre reversível; Aposentadoria é sempre irreversível e definitiva.
 * Estrutura definida em AGENT_FRAMEWORK_CONCRETE_STRUCTURE.md.
 */
export type AgentLifecycleStage =
  | "Criação"
  | "Registro"
  | "Inicialização"
  | "Execução"
  | "Pausa"
  | "Retomada"
  | "Atualização"
  | "Desativação"
  | "Aposentadoria";

export interface AgentLifecycleState {
  /** Agente ao qual este estado se refere. */
  readonly agentId: string;

  /** Estágio atual do ciclo de vida. */
  readonly stage: AgentLifecycleStage;

  /** Momento em que o Agente entrou neste estágio. */
  readonly enteredAt: Date;
}
