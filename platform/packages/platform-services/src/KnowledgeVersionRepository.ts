import type { KnowledgeVersion } from "./KnowledgeVersion.js";

/**
 * Knowledge Version Repository — "nenhuma atualização de conhecimento sobrescreve silenciosamente o
 * que existia antes" (ADR-005). Cada versão é um fato imutável; nunca `update` nem `remove`.
 */
export interface KnowledgeVersionRepository {
  create(version: KnowledgeVersion): Promise<KnowledgeVersion>;
  listByAssetId(assetId: string): Promise<readonly KnowledgeVersion[]>;
}
