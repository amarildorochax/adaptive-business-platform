/**
 * Multi-Agent Identity — a identidade declarativa de um grupo de Agentes colaborando por um resultado
 * que nenhum Agente individual alcançaria sozinho.
 * Estrutura definida em MULTI_AGENT_CONCRETE_STRUCTURE.md.
 */
export interface MultiAgentIdentity {
  /** Identificador do grupo. */
  readonly groupId: string;

  /** Nome do grupo. */
  readonly name: string;
}
