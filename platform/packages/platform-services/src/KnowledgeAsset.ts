/**
 * Knowledge Asset — registro individual de conhecimento, estruturado por tipo, categoria e tags,
 * isolado por Tenant.
 * Estrutura, regras e invariantes definidas em KNOWLEDGE_CONCRETE_STRUCTURE.md.
 */
import type { KnowledgeType } from "./KnowledgeType.js";

export interface KnowledgeAsset {
  /** Identificador do ativo de conhecimento. */
  readonly assetId: string;

  /** Tenant ao qual o ativo pertence — isolamento absoluto, inclusive no índice de busca. */
  readonly tenantId: string;

  /** Tipo do ativo. */
  readonly type: KnowledgeType;

  /** Categoria do ativo, quando atribuída. */
  readonly category?: string;

  /** Tags associadas ao ativo. */
  readonly tags: readonly string[];
}
