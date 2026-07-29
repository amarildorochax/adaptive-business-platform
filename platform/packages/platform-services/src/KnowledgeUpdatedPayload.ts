/**
 * Knowledge Updated Payload — conteúdo do evento "KnowledgeUpdated" (SYSTEM_BLUEPRINT.md), consumível
 * pelo contrato genérico Event<TPayload> já implementado em @abp/core, nunca redefinido aqui.
 * Estrutura definida em KNOWLEDGE_CONCRETE_STRUCTURE.md.
 */
export interface KnowledgeUpdatedPayload {
  /** Ativo atualizado. */
  readonly assetId: string;

  /** Tenant ao qual o ativo pertence. */
  readonly tenantId: string;

  /** Versão resultante da atualização. */
  readonly version: number;
}
