/**
 * Multi-Agent Definition — os Agentes membros de um grupo, cada um referenciado apenas por
 * identificador opaco, nunca por vínculo direto entre si.
 * Estrutura definida em MULTI_AGENT_CONCRETE_STRUCTURE.md.
 */
export interface MultiAgentDefinition {
  /** Grupo definido. */
  readonly groupId: string;

  /** Identificadores dos Agentes membros do grupo. */
  readonly memberAgentIds: readonly string[];
}
