/**
 * Knowledge Indexed Payload — conteúdo do evento "KnowledgeIndexed" (`EVENT_CATALOG.md`: "comunicar
 * conclusão de indexação semântica de um Document... Payload conceitual: identificador, Retrieval
 * Index associado"), consumível pelo contrato genérico Event<TPayload> já implementado em @abp/core,
 * nunca redefinido aqui — mesma disciplina já aplicada a `KnowledgeUpdatedPayload.ts`. Nenhum
 * "Retrieval Index" é modelado como Entity própria nesta Sprint (Embedding Manager fora de escopo) —
 * `indexedAt` é a única referência ao registro de indexação, o mesmo já carregado por `IndexEntry`.
 */
export interface KnowledgeIndexedPayload {
  /** Ativo indexado. */
  readonly assetId: string;

  /** Tenant ao qual o ativo pertence. */
  readonly tenantId: string;

  /** Momento da indexação. */
  readonly indexedAt: Date;
}
