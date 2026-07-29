/**
 * Multi-Agent Role — o papel de um Agente dentro de um grupo específico; adicionar um Agente significa
 * conceder-lhe um objetivo e uma fronteira, nunca modificar qualquer outro Agente já existente.
 * Estrutura definida em MULTI_AGENT_CONCRETE_STRUCTURE.md.
 */
export interface MultiAgentRole {
  /** Grupo ao qual este papel pertence. */
  readonly groupId: string;

  /** Agente ao qual este papel se refere. */
  readonly agentId: string;

  /** Descrição do papel (objetivo e fronteira) deste Agente dentro do grupo. */
  readonly role: string;
}
