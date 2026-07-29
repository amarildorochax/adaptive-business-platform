/**
 * Multi-Agent Capability — as Capabilities que um grupo, em conjunto, apoia, agregando as capacidades
 * já individualmente declaradas por cada Agente membro.
 * Estrutura definida em MULTI_AGENT_CONCRETE_STRUCTURE.md.
 */
export interface MultiAgentCapability {
  /** Grupo associado. */
  readonly groupId: string;

  /** Capabilities que o grupo, em conjunto, apoia. */
  readonly capabilityIds: readonly string[];
}
