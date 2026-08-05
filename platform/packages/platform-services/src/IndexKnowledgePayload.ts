/**
 * Index Knowledge Payload — conteúdo do Command "IndexKnowledge" (`COMMAND_CATALOG.md`: "gerar
 * indexação semântica de um Document"), consumível pelo contrato genérico Command<TPayload> já
 * implementado em @abp/core, nunca redefinido aqui — mesma disciplina já aplicada a
 * `KnowledgeUpdatedPayload.ts`.
 *
 * Apesar do nome do Command citar "indexação semântica", o Core desta Sprint implementa apenas o
 * Index Manager (indexação estrutural — Capítulo 7), nunca o Embedding Manager (RAG/Embeddings/Vector
 * Search, fora de escopo desta Sprint) — ver `KNOWLEDGE_HUB_CORE_MIGRATION_REPORT.md`, "Lacunas
 * Arquiteturais".
 */
export interface IndexKnowledgePayload {
  /** Ativo já publicado a ser indexado. */
  readonly assetId: string;

  /** Tenant ao qual o ativo pertence. */
  readonly tenantId: string;
}
