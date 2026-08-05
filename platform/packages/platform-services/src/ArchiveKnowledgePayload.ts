/**
 * Archive Knowledge Payload — conteúdo do Command "ArchiveKnowledge" (`COMMAND_CATALOG.md`: "arquivar
 * Document não mais relevante"), consumível pelo contrato genérico Command<TPayload> já implementado
 * em @abp/core, nunca redefinido aqui — mesma disciplina já aplicada a `KnowledgeUpdatedPayload.ts`.
 */
export interface ArchiveKnowledgePayload {
  /** Ativo já existente a ser arquivado. */
  readonly assetId: string;

  /** Tenant ao qual o ativo pertence. */
  readonly tenantId: string;

  /** Motivo do arquivamento — "Validações conceituais: motivo de arquivamento presente" (`COMMAND_CATALOG.md`). */
  readonly reason: string;
}
