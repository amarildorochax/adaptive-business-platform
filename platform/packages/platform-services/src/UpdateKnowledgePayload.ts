/**
 * Update Knowledge Payload — conteúdo do Command "UpdateKnowledge" (`COMMAND_CATALOG.md`: "atualizar
 * Document já indexado"), consumível pelo contrato genérico Command<TPayload> já implementado em
 * @abp/core, nunca redefinido aqui — mesma disciplina já aplicada a `KnowledgeUpdatedPayload.ts`.
 */
export interface UpdateKnowledgePayload {
  /** Ativo já existente a ser atualizado. */
  readonly assetId: string;

  /** Tenant ao qual o ativo pertence. */
  readonly tenantId: string;
}
