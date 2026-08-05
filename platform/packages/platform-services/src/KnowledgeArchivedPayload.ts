/**
 * Knowledge Archived Payload — conteúdo do evento "KnowledgeArchived" (`EVENT_CATALOG.md`: "comunicar
 * arquivamento de um Document... Payload conceitual: identificador, motivo"), consumível pelo
 * contrato genérico Event<TPayload> já implementado em @abp/core, nunca redefinido aqui — mesma
 * disciplina já aplicada a `KnowledgeUpdatedPayload.ts`.
 */
export interface KnowledgeArchivedPayload {
  /** Ativo arquivado. */
  readonly assetId: string;

  /** Tenant ao qual o ativo pertence. */
  readonly tenantId: string;

  /** Motivo do arquivamento. */
  readonly reason: string;
}
