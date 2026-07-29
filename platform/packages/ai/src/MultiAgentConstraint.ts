/**
 * Multi-Agent Constraint — uma restrição de colaboração aplicável a um grupo, incluindo a garantia
 * estrutural de que nenhum Agente coordena outro diretamente (Agents Never Coordinate Themselves).
 * Estrutura definida em MULTI_AGENT_CONCRETE_STRUCTURE.md.
 */
export interface MultiAgentConstraint {
  /** Grupo ao qual esta restrição se aplica. */
  readonly groupId: string;

  /** Descrição da restrição de colaboração. */
  readonly description: string;
}
