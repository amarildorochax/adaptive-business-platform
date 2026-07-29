/**
 * Multi-Agent Shared Context — referência conceitual ao registro compartilhado do que já aconteceu na
 * plataforma, consultável por um grupo sem que isso represente dependência sobre o Agente que o
 * produziu.
 * Estrutura definida em MULTI_AGENT_CONCRETE_STRUCTURE.md.
 */
export interface MultiAgentSharedContext {
  /** Grupo ao qual este contexto compartilhado se refere. */
  readonly groupId: string;

  /** Descrição conceitual do registro compartilhado consultado pelo grupo. */
  readonly sharedRecordDescription: string;
}
