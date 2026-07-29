/**
 * Multi-Agent Metadata — metadado estrutural de um grupo, sustentando a mesma disciplina de
 * rastreabilidade já aplicada aos demais componentes de AI Core.
 * Estrutura definida em MULTI_AGENT_CONCRETE_STRUCTURE.md.
 */
export interface MultiAgentMetadata {
  /** Identificador do grupo. */
  readonly groupId: string;

  /** Momento de criação do grupo. */
  readonly createdAt: Date;

  /** Versão do grupo. */
  readonly version: string;
}
